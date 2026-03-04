import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';

const generateRef = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export interface CreateOrderDto {
  customerName: string;
  paymentMethod: 'STRIPE' | 'PAY_AT_COUNTER';
  items: Array<{ menuItemId: string; quantity: number }>;
}

// Forward-only status transition map
// RECEIVED → PREPARING → READY → COMPLETED
// RECEIVED or PREPARING → CANCELLED
const VALID_TRANSITIONS: Record<string, string[]> = {
  RECEIVED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  PENDING_PAYMENT: [],
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private _stripe: Stripe | undefined;

  private get stripe(): Stripe {
    if (!this._stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
      this._stripe = new Stripe(key);
    }
    return this._stripe;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: OrdersGateway,
  ) {}

  /**
   * Create an order for the given venue slug.
   * - Validates venue exists
   * - Validates all menu items exist in this venue and fetches current prices for snapshot
   * - Calculates totalAmount from current prices * quantities (INFR-03)
   * - PAY_AT_COUNTER: creates order in RECEIVED status immediately; emits order:new to venue room
   * - STRIPE: creates order in PENDING_PAYMENT status (transitions via webhook)
   */
  async create(slug: string, dto: CreateOrderDto) {
    // Find venue by slug
    const venue = await this.prisma.venue.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
    if (!venue) {
      throw new NotFoundException(`Venue with slug "${slug}" not found`);
    }

    // Validate all items and fetch current prices for snapshot
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: dto.items.map((i) => i.menuItemId) },
        venueId: venue.id,
      },
      select: { id: true, name: true, price: true },
    });

    if (menuItems.length !== dto.items.length) {
      const foundIds = new Set(menuItems.map((m) => m.id));
      const missingIds = dto.items
        .map((i) => i.menuItemId)
        .filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Menu items not found in this venue: ${missingIds.join(', ')}`,
      );
    }

    // Build item price lookup
    const priceMap = new Map(menuItems.map((m) => [m.id, m]));

    // Calculate total from current prices (INFR-03 snapshot requirement)
    let totalAmount = 0;
    for (const item of dto.items) {
      const menuItem = priceMap.get(item.menuItemId)!;
      totalAmount += Number(menuItem.price) * item.quantity;
    }

    const referenceCode = generateRef();
    const status =
      dto.paymentMethod === 'PAY_AT_COUNTER' ? 'RECEIVED' : 'PENDING_PAYMENT';

    const order = await this.prisma.order.create({
      data: {
        venueId: venue.id,
        status,
        paymentMethod: dto.paymentMethod,
        totalAmount,
        referenceCode,
        customerName: dto.customerName,
        items: {
          create: dto.items.map((item) => {
            const menuItem = priceMap.get(item.menuItemId)!;
            return {
              menuItemId: item.menuItemId,
              itemNameAtOrder: menuItem.name,
              unitPriceAtOrder: menuItem.price,
              quantity: item.quantity,
            };
          }),
        },
      },
      select: {
        id: true,
        referenceCode: true,
        status: true,
        totalAmount: true,
        customerName: true,
        createdAt: true,
        items: {
          select: {
            itemNameAtOrder: true,
            unitPriceAtOrder: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.log(
      `Order ${order.referenceCode} created for venue ${slug} — status: ${status}`,
    );

    // PAY_AT_COUNTER orders are immediately RECEIVED — emit order:new to venue dashboard
    if (status === 'RECEIVED') {
      this.gateway.emitNewOrder(venue.id, {
        id: order.id,
        referenceCode: order.referenceCode,
        status: order.status,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items,
      });
    }

    return {
      id: order.id,
      referenceCode: order.referenceCode,
      status: order.status,
      totalAmount: order.totalAmount,
      venueSlug: slug,
    };
  }

  /**
   * Create a Stripe PaymentIntent for an order in PENDING_PAYMENT status.
   * Stores paymentIntentId on the order record for reconciliation.
   * Returns { clientSecret } for the client to complete payment.
   */
  async createPaymentIntent(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, totalAmount: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(
        `Order ${orderId} is not in PENDING_PAYMENT status (current: ${order.status})`,
      );
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: process.env.STRIPE_CURRENCY ?? 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId },
    });

    // Store paymentIntentId for reconciliation (Pitfall 2 prevention)
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId: paymentIntent.id },
    });

    this.logger.log(
      `PaymentIntent ${paymentIntent.id} created for order ${orderId}`,
    );

    return { clientSecret: paymentIntent.client_secret };
  }

  /**
   * Transition an order to RECEIVED status.
   * Called ONLY by the Stripe webhook handler (payment_intent.succeeded).
   * This is the SOLE trigger for RECEIVED status (INFR-02).
   * Emits order:new to the venue room after transition.
   */
  async markOrderReceived(orderId: string, paymentIntentId: string) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'RECEIVED' },
    });

    // Fetch full order details for the emission payload (dashboard card data)
    const fullOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        referenceCode: true,
        status: true,
        customerName: true,
        totalAmount: true,
        createdAt: true,
        venueId: true,
        items: {
          select: {
            itemNameAtOrder: true,
            unitPriceAtOrder: true,
            quantity: true,
          },
        },
      },
    });

    if (fullOrder) {
      this.gateway.emitNewOrder(fullOrder.venueId, {
        id: fullOrder.id,
        referenceCode: fullOrder.referenceCode,
        status: fullOrder.status,
        customerName: fullOrder.customerName,
        totalAmount: fullOrder.totalAmount,
        createdAt: fullOrder.createdAt,
        items: fullOrder.items,
      });
    }

    this.logger.log(
      `Order ${orderId} marked RECEIVED via payment_intent ${paymentIntentId}`,
    );
  }

  /**
   * Cancel an order. Called by the Stripe webhook handler on payment failure.
   */
  async cancelOrder(orderId: string, reason: string) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
    this.logger.log(`Order ${orderId} CANCELLED — reason: ${reason}`);
  }

  /**
   * Update order status for a specific venue.
   * Validates:
   *  - Order belongs to the venue
   *  - Status transition is forward-only: RECEIVED->PREPARING->READY->COMPLETED
   *    CANCELLED is allowed from RECEIVED or PREPARING only
   * Emits order:updated to both venue and order rooms via gateway.
   */
  async updateStatus(
    venueId: string,
    orderId: string,
    newStatus: 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED',
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, venueId },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new NotFoundException(
        `Order ${orderId} not found in venue ${venueId}`,
      );
    }

    const validNext = VALID_TRANSITIONS[order.status] ?? [];
    if (!validNext.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${order.status} → ${newStatus}. ` +
          `Valid transitions from ${order.status}: [${validNext.join(', ') || 'none'}]`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      select: {
        id: true,
        referenceCode: true,
        status: true,
        customerName: true,
        totalAmount: true,
        createdAt: true,
        _count: {
          select: { items: true },
        },
      },
    });

    this.gateway.emitOrderUpdated(venueId, orderId, updatedOrder);

    this.logger.log(
      `Order ${orderId} status updated: ${order.status} → ${newStatus}`,
    );

    return updatedOrder;
  }

  /**
   * Find all active (non-completed) orders for a venue.
   * Returns orders in RECEIVED, PREPARING, or READY status ordered by creation time (oldest first).
   * Used for the initial dashboard load and reconnect sync.
   */
  async findActiveOrders(venueId: string) {
    return this.prisma.order.findMany({
      where: {
        venueId,
        status: { in: ['RECEIVED', 'PREPARING', 'READY'] },
      },
      select: {
        id: true,
        referenceCode: true,
        status: true,
        customerName: true,
        totalAmount: true,
        createdAt: true,
        items: {
          select: {
            itemNameAtOrder: true,
            unitPriceAtOrder: true,
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Find an order for public display (no auth).
   * Verifies venue slug matches the order's venue for security.
   * Returns order details with items for the order status page.
   */
  async findPublic(orderId: string, slug: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        venue: { select: { slug: true } },
        items: {
          select: {
            itemNameAtOrder: true,
            unitPriceAtOrder: true,
            quantity: true,
          },
        },
      },
    });

    if (!order || order.venue.slug !== slug) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      id: order.id,
      referenceCode: order.referenceCode,
      status: order.status,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        itemNameAtOrder: item.itemNameAtOrder,
        unitPriceAtOrder: item.unitPriceAtOrder,
        quantity: item.quantity,
      })),
    };
  }
}

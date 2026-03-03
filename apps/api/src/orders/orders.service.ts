import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

const generateRef = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export interface CreateOrderDto {
  customerName: string;
  paymentMethod: 'STRIPE' | 'PAY_AT_COUNTER';
  items: Array<{ menuItemId: string; quantity: number }>;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an order for the given venue slug.
   * - Validates venue exists
   * - Validates all menu items exist in this venue and fetches current prices for snapshot
   * - Calculates totalAmount from current prices * quantities (INFR-03)
   * - PAY_AT_COUNTER: creates order in RECEIVED status immediately
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
      },
    });

    this.logger.log(
      `Order ${order.referenceCode} created for venue ${slug} — status: ${status}`,
    );

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
   */
  async markOrderReceived(orderId: string, paymentIntentId: string) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'RECEIVED' },
    });
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

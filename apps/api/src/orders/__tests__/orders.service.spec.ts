import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from '../orders.service';

// Mock nanoid to return deterministic reference codes
vi.mock('nanoid', () => ({
  customAlphabet: () => () => 'ABCD1234',
}));

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrisma = {
    venue: { findUnique: vi.fn() },
    menuItem: { findMany: vi.fn() },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  const mockGateway = {
    emitNewOrder: vi.fn(),
    emitOrderUpdated: vi.fn(),
  };

  const testVenue = { id: 'venue-1', slug: 'test-cafe' };

  const testMenuItems = [
    { id: 'item-1', name: 'Burger', price: 9.99 },
    { id: 'item-2', name: 'Fries', price: 3.99 },
  ];

  const baseDto = {
    customerName: 'John',
    paymentMethod: 'PAY_AT_COUNTER' as const,
    items: [
      { menuItemId: 'item-1', quantity: 2 },
      { menuItemId: 'item-2', quantity: 1 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OrdersService(mockPrisma as any, mockGateway as any);
  });

  describe('create', () => {
    const createdOrder = {
      id: 'order-1',
      referenceCode: 'ABCD1234',
      status: 'RECEIVED',
      totalAmount: 23.97,
      customerName: 'John',
      createdAt: new Date('2026-04-04T00:00:00Z'),
      items: [
        { itemNameAtOrder: 'Burger', unitPriceAtOrder: 9.99, quantity: 2 },
        { itemNameAtOrder: 'Fries', unitPriceAtOrder: 3.99, quantity: 1 },
      ],
    };

    it('creates PAY_AT_COUNTER order in RECEIVED status and emits order:new', async () => {
      mockPrisma.venue.findUnique.mockResolvedValue(testVenue);
      mockPrisma.menuItem.findMany.mockResolvedValue(testMenuItems);
      mockPrisma.order.create.mockResolvedValue(createdOrder);

      const result = await service.create('test-cafe', baseDto);

      expect(result).toEqual({
        id: 'order-1',
        referenceCode: 'ABCD1234',
        status: 'RECEIVED',
        totalAmount: 23.97,
        venueSlug: 'test-cafe',
      });

      // Verify totalAmount calculated from prices * quantities
      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 23.97, // 9.99*2 + 3.99*1
            status: 'RECEIVED',
            venueId: 'venue-1',
          }),
        }),
      );

      expect(mockGateway.emitNewOrder).toHaveBeenCalledWith('venue-1', expect.objectContaining({
        id: 'order-1',
        referenceCode: 'ABCD1234',
        status: 'RECEIVED',
      }));
    });

    it('creates STRIPE order in PENDING_PAYMENT status and does NOT emit order:new', async () => {
      mockPrisma.venue.findUnique.mockResolvedValue(testVenue);
      mockPrisma.menuItem.findMany.mockResolvedValue(testMenuItems);
      mockPrisma.order.create.mockResolvedValue({
        ...createdOrder,
        status: 'PENDING_PAYMENT',
      });

      const stripeDto = { ...baseDto, paymentMethod: 'STRIPE' as const };
      const result = await service.create('test-cafe', stripeDto);

      expect(result.status).toBe('PENDING_PAYMENT');
      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING_PAYMENT',
          }),
        }),
      );
      expect(mockGateway.emitNewOrder).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when venue not found', async () => {
      mockPrisma.venue.findUnique.mockResolvedValue(null);

      await expect(service.create('no-venue', baseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when menu items not found in venue', async () => {
      mockPrisma.venue.findUnique.mockResolvedValue(testVenue);
      // Only return one of two requested items
      mockPrisma.menuItem.findMany.mockResolvedValue([testMenuItems[0]]);

      await expect(service.create('test-cafe', baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('transitions RECEIVED -> PREPARING and emits order:updated', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'RECEIVED',
      });
      const updatedOrder = {
        id: 'order-1',
        referenceCode: 'ABCD1234',
        status: 'PREPARING',
        customerName: 'John',
        totalAmount: 23.97,
        createdAt: new Date(),
        _count: { items: 2 },
      };
      mockPrisma.order.update.mockResolvedValue(updatedOrder);

      const result = await service.updateStatus('venue-1', 'order-1', 'PREPARING');

      expect(result.status).toBe('PREPARING');
      expect(mockGateway.emitOrderUpdated).toHaveBeenCalledWith(
        'venue-1',
        'order-1',
        updatedOrder,
      );
    });

    it('throws BadRequestException for invalid transition COMPLETED -> PREPARING', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'COMPLETED',
      });

      await expect(
        service.updateStatus('venue-1', 'order-1', 'PREPARING'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('venue-1', 'order-999', 'PREPARING'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPublic', () => {
    it('returns order when slug matches venue', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        referenceCode: 'ABCD1234',
        status: 'RECEIVED',
        customerName: 'John',
        totalAmount: 23.97,
        createdAt: new Date('2026-04-04T00:00:00Z'),
        venue: { slug: 'test-cafe' },
        items: [
          { itemNameAtOrder: 'Burger', unitPriceAtOrder: 9.99, quantity: 2 },
        ],
      });

      const result = await service.findPublic('order-1', 'test-cafe');

      expect(result.id).toBe('order-1');
      expect(result.referenceCode).toBe('ABCD1234');
      expect(result.items).toHaveLength(1);
    });

    it('throws NotFoundException when slug does not match', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        venue: { slug: 'other-cafe' },
        items: [],
      });

      await expect(
        service.findPublic('order-1', 'test-cafe'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

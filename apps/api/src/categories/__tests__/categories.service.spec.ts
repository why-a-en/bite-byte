import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesService } from '../categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrisma = {
    venue: { findFirst: vi.fn() },
    menuCategory: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  const venueId = 'venue-1';
  const userId = 'user-1';
  const categoryId = 'cat-1';

  const testCategory = {
    id: 'cat-1',
    name: 'Starters',
    sortOrder: 0,
    venueId: 'venue-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  /** Helper: configure venue ownership mock to pass */
  function mockOwnershipPass() {
    mockPrisma.venue.findFirst.mockResolvedValueOnce({ id: venueId });
  }

  /** Helper: configure venue ownership mock to fail — venue exists but wrong owner */
  function mockOwnershipForbidden() {
    // First call (with ownerId filter) returns null
    mockPrisma.venue.findFirst.mockResolvedValueOnce(null);
    // Second call (venue exists check) returns the venue
    mockPrisma.venue.findFirst.mockResolvedValueOnce({ id: venueId });
  }

  /** Helper: configure venue ownership mock to fail — venue does not exist */
  function mockOwnershipNotFound() {
    // First call (with ownerId filter) returns null
    mockPrisma.venue.findFirst.mockResolvedValueOnce(null);
    // Second call (venue exists check) also returns null
    mockPrisma.venue.findFirst.mockResolvedValueOnce(null);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CategoriesService(mockPrisma as any);
  });

  describe('create', () => {
    it('creates category when ownership passes', async () => {
      mockOwnershipPass();
      mockPrisma.menuCategory.create.mockResolvedValue(testCategory);

      const result = await service.create(venueId, userId, {
        name: 'Starters',
        sortOrder: 0,
      });

      expect(result).toEqual(testCategory);
      expect(mockPrisma.menuCategory.create).toHaveBeenCalledWith({
        data: { venueId, name: 'Starters', sortOrder: 0 },
      });
    });

    it('throws ForbiddenException when venue exists but user does not own it', async () => {
      mockOwnershipForbidden();

      await expect(
        service.create(venueId, 'other-user', { name: 'Starters' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when venue does not exist', async () => {
      mockOwnershipNotFound();

      await expect(
        service.create('no-venue', userId, { name: 'Starters' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns categories ordered by sortOrder with items included', async () => {
      mockOwnershipPass();
      const categories = [
        { ...testCategory, items: [{ id: 'item-1', name: 'Bruschetta' }] },
      ];
      mockPrisma.menuCategory.findMany.mockResolvedValue(categories);

      const result = await service.findAll(venueId, userId);

      expect(result).toEqual(categories);
      expect(mockPrisma.menuCategory.findMany).toHaveBeenCalledWith({
        where: { venueId },
        orderBy: { sortOrder: 'asc' },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      });
    });
  });

  describe('update', () => {
    it('updates category when ownership passes and category exists', async () => {
      mockOwnershipPass();
      mockPrisma.menuCategory.findFirst.mockResolvedValue(testCategory);
      const updated = { ...testCategory, name: 'Mains' };
      mockPrisma.menuCategory.update.mockResolvedValue(updated);

      const result = await service.update(venueId, categoryId, userId, {
        name: 'Mains',
      });

      expect(result.name).toBe('Mains');
      expect(mockPrisma.menuCategory.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: { name: 'Mains' },
      });
    });

    it('throws NotFoundException when category not in venue', async () => {
      mockOwnershipPass();
      mockPrisma.menuCategory.findFirst.mockResolvedValue(null);

      await expect(
        service.update(venueId, 'no-cat', userId, { name: 'Mains' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes category when no items exist', async () => {
      mockOwnershipPass();
      mockPrisma.menuCategory.findFirst.mockResolvedValue({
        ...testCategory,
        _count: { items: 0 },
      });

      await service.remove(venueId, categoryId, userId);

      expect(mockPrisma.menuCategory.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('throws ConflictException when category has items', async () => {
      mockOwnershipPass();
      mockPrisma.menuCategory.findFirst.mockResolvedValue({
        ...testCategory,
        _count: { items: 3 },
      });

      await expect(
        service.remove(venueId, categoryId, userId),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.menuCategory.delete).not.toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('runs $transaction with batch updates for reorder items', async () => {
      mockOwnershipPass();
      mockPrisma.$transaction.mockResolvedValue([]);

      const items = [
        { id: 'cat-1', sortOrder: 1 },
        { id: 'cat-2', sortOrder: 0 },
      ];

      await service.reorder(venueId, userId, items);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([expect.anything(), expect.anything()]),
      );
    });
  });
});

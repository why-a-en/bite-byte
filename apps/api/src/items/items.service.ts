import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuItem } from '../generated/prisma/client';

export interface CreateItemDto {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  sortOrder?: number;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sortOrder?: number;
  categoryId?: string;
}

export interface ToggleAvailabilityDto {
  isAvailable: boolean;
}

/**
 * ItemsService: menu item CRUD with ownership verification.
 *
 * Venue ownership is verified inline (not delegated to VenuesModule) to avoid
 * circular dependencies. Price is stored as Decimal in Prisma — the number
 * from the client is passed directly; Prisma handles the Decimal conversion.
 */
@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify that the venue exists and is owned by userId.
   * Throws 403 ForbiddenException if venue exists but is not owned.
   * Throws 404 NotFoundException if venue does not exist at all.
   */
  private async verifyVenueOwnership(venueId: string, userId: string): Promise<void> {
    const venue = await this.prisma.venue.findFirst({
      where: { id: venueId, ownerId: userId },
      select: { id: true },
    });
    if (!venue) {
      const exists = await this.prisma.venue.findFirst({
        where: { id: venueId },
        select: { id: true },
      });
      if (exists) {
        throw new ForbiddenException(`You do not own venue ${venueId}`);
      }
      throw new NotFoundException(`Venue ${venueId} not found`);
    }
  }

  /**
   * Create a menu item under a specific category.
   * Sets venueId on the item (for Phase 3 RLS customer queries).
   * Verifies venue ownership before creating.
   */
  async create(
    venueId: string,
    categoryId: string,
    userId: string,
    dto: CreateItemDto,
  ): Promise<MenuItem> {
    await this.verifyVenueOwnership(venueId, userId);
    // Verify the category belongs to this venue
    const category = await this.prisma.menuCategory.findFirst({
      where: { id: categoryId, venueId },
    });
    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found in venue ${venueId}`);
    }
    return this.prisma.menuItem.create({
      data: {
        venueId,
        categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * List all items for a venue across all categories.
   * Ordered by category sortOrder, then item sortOrder.
   */
  async findAll(venueId: string, userId: string): Promise<MenuItem[]> {
    await this.verifyVenueOwnership(venueId, userId);
    return this.prisma.menuItem.findMany({
      where: { venueId },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
      ],
    });
  }

  /**
   * Update a menu item. Partial update — only provided fields are changed.
   * Verifies venue ownership and item membership.
   */
  async update(
    venueId: string,
    itemId: string,
    userId: string,
    dto: UpdateItemDto,
  ): Promise<MenuItem> {
    await this.verifyVenueOwnership(venueId, userId);
    const item = await this.prisma.menuItem.findFirst({
      where: { id: itemId, venueId },
    });
    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found in venue ${venueId}`);
    }
    return this.prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      },
    });
  }

  /**
   * Delete a menu item.
   * Verifies venue ownership and item membership.
   */
  async remove(venueId: string, itemId: string, userId: string): Promise<void> {
    await this.verifyVenueOwnership(venueId, userId);
    const item = await this.prisma.menuItem.findFirst({
      where: { id: itemId, venueId },
    });
    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found in venue ${venueId}`);
    }
    await this.prisma.menuItem.delete({ where: { id: itemId } });
  }

  /**
   * Toggle item availability (the "86 an item" endpoint — MENU-06).
   * Updates isAvailable without deleting the item.
   * Verifies venue ownership and item membership.
   */
  async toggleAvailability(
    venueId: string,
    itemId: string,
    userId: string,
    dto: ToggleAvailabilityDto,
  ): Promise<MenuItem> {
    await this.verifyVenueOwnership(venueId, userId);
    const item = await this.prisma.menuItem.findFirst({
      where: { id: itemId, venueId },
    });
    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found in venue ${venueId}`);
    }
    return this.prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable: dto.isAvailable },
    });
  }
}

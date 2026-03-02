import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuCategory } from '../generated/prisma/client';

export interface CreateCategoryDto {
  name: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  sortOrder?: number;
}

export interface ReorderItem {
  id: string;
  sortOrder: number;
}

/**
 * CategoriesService: all operations verify venue ownership inline
 * via `prisma.venue.findFirst({ where: { id: venueId, ownerId: userId } })`.
 *
 * Venue ownership check is inlined (not delegated to VenuesModule) to avoid
 * circular dependency between VenuesModule and CategoriesModule.
 */
@Injectable()
export class CategoriesService {
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
      // Check if venue exists at all to return the right error code
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
   * Create a category for a venue.
   * Verifies venue ownership before creating.
   */
  async create(
    venueId: string,
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<MenuCategory> {
    await this.verifyVenueOwnership(venueId, userId);
    return this.prisma.menuCategory.create({
      data: {
        venueId,
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * List all categories for a venue, ordered by sortOrder.
   * Includes items in each category (ordered by item sortOrder).
   */
  async findAll(
    venueId: string,
    userId: string,
  ): Promise<(MenuCategory & { items: unknown[] })[]> {
    await this.verifyVenueOwnership(venueId, userId);
    return this.prisma.menuCategory.findMany({
      where: { venueId },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Update a category (name or sortOrder).
   * Verifies venue ownership and category membership.
   */
  async update(
    venueId: string,
    categoryId: string,
    userId: string,
    dto: UpdateCategoryDto,
  ): Promise<MenuCategory> {
    await this.verifyVenueOwnership(venueId, userId);
    const category = await this.prisma.menuCategory.findFirst({
      where: { id: categoryId, venueId },
    });
    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found in venue ${venueId}`);
    }
    return this.prisma.menuCategory.update({
      where: { id: categoryId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  /**
   * Delete a category.
   * Rejects with 409 if the category has items to prevent accidental data loss.
   * Verifies venue ownership before deleting.
   */
  async remove(venueId: string, categoryId: string, userId: string): Promise<void> {
    await this.verifyVenueOwnership(venueId, userId);
    const category = await this.prisma.menuCategory.findFirst({
      where: { id: categoryId, venueId },
      include: { _count: { select: { items: true } } },
    });
    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found in venue ${venueId}`);
    }
    if ((category as typeof category & { _count: { items: number } })._count.items > 0) {
      throw new ConflictException(
        `Category ${categoryId} has items — delete all items first`,
      );
    }
    await this.prisma.menuCategory.delete({ where: { id: categoryId } });
  }

  /**
   * Bulk update sortOrder for multiple categories in a single transaction.
   * This is the DnD persistence endpoint — accepts [{id, sortOrder}] array.
   */
  async reorder(
    venueId: string,
    userId: string,
    items: ReorderItem[],
  ): Promise<void> {
    await this.verifyVenueOwnership(venueId, userId);
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.menuCategory.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }
}

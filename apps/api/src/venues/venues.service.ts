import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Venue } from '../generated/prisma/client';
import { PaymentMode } from '../generated/prisma/enums';

export interface CreateVenueDto {
  name: string;
  slug: string;
  logoUrl?: string;
  paymentMode?: PaymentMode;
}

export interface UpdateVenueDto {
  name?: string;
  slug?: string;
  logoUrl?: string;
  paymentMode?: PaymentMode;
}

/**
 * VenuesService: all queries are scoped to the authenticated owner's userId.
 *
 * This is application-layer security — NOT RLS. The CLS/RLS pattern is for
 * Phase 3 customer-facing routes. Owner dashboard routes use WHERE ownerId = userId.
 */
@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a venue for the authenticated owner.
   * Throws ConflictException (409) if slug is already taken.
   */
  async create(userId: string, dto: CreateVenueDto): Promise<Venue> {
    try {
      return await this.prisma.venue.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          logoUrl: dto.logoUrl,
          paymentMode: dto.paymentMode,
          ownerId: userId,
        },
      });
    } catch (err: unknown) {
      // Prisma unique constraint violation code
      if (
        err !== null &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
      throw err;
    }
  }

  /**
   * List all venues owned by userId, ordered by creation date.
   * Includes the count of categories for each venue.
   */
  async findAllForOwner(
    userId: string,
  ): Promise<(Venue & { _count: { categories: number } })[]> {
    return this.prisma.venue.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { categories: true },
        },
      },
    });
  }

  /**
   * Find a single venue by ID, only if owned by userId.
   * Throws NotFoundException (404) if not found or not owned.
   */
  async findOneForOwner(id: string, userId: string): Promise<Venue> {
    const venue = await this.prisma.venue.findFirst({
      where: { id, ownerId: userId },
    });
    if (!venue) {
      throw new NotFoundException(`Venue ${id} not found`);
    }
    return venue;
  }

  /**
   * Update venue settings. Only updates if venue is owned by userId.
   * Throws ConflictException if new slug is already taken.
   */
  async update(id: string, userId: string, dto: UpdateVenueDto): Promise<Venue> {
    // Verify ownership first
    await this.findOneForOwner(id, userId);

    try {
      return await this.prisma.venue.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
          ...(dto.paymentMode !== undefined && { paymentMode: dto.paymentMode }),
        },
      });
    } catch (err: unknown) {
      if (
        err !== null &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
      throw err;
    }
  }

  /**
   * Delete a venue (cascades categories and items via DB FK cascade).
   * Only deletes if venue is owned by userId.
   */
  async remove(id: string, userId: string): Promise<void> {
    // Verify ownership first
    await this.findOneForOwner(id, userId);
    await this.prisma.venue.delete({ where: { id } });
  }
}

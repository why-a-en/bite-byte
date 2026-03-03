import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicMenuService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch venue menu by slug for public (unauthenticated) display.
   * Returns ALL items (available and unavailable) — client dims unavailable ones.
   * Throws NotFoundException if venue does not exist.
   */
  async getMenuBySlug(slug: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with slug "${slug}" not found`);
    }

    return {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      logoUrl: venue.logoUrl,
      paymentMode: venue.paymentMode,
      categories: venue.categories.map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        items: category.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          sortOrder: item.sortOrder,
        })),
      })),
    };
  }
}

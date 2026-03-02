import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ItemsService,
  CreateItemDto,
  UpdateItemDto,
  ToggleAvailabilityDto,
} from './items.service';

/**
 * ItemsController: menu item CRUD + availability toggle.
 *
 * Items are nested under venues for creation (and categoryId is in the path),
 * but can be listed/updated/deleted at the venue level (simpler for dashboard use).
 *
 * All endpoints protected by JwtAuthGuard. Venue ownership verified in service layer.
 */
@Controller('venues/:venueId')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * POST /venues/:venueId/categories/:categoryId/items
   * Create a menu item under a specific category.
   * Returns 403/404 if venue not owned or category not found.
   */
  @Post('categories/:categoryId/items')
  async create(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: CreateItemDto,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.itemsService.create(venueId, categoryId, userId, dto);
  }

  /**
   * GET /venues/:venueId/items
   * List all items for a venue (across all categories).
   * Ordered by category sortOrder then item sortOrder.
   */
  @Get('items')
  async findAll(@Req() req: Request, @Param('venueId') venueId: string) {
    const userId = (req.user as { userId: string }).userId;
    return this.itemsService.findAll(venueId, userId);
  }

  /**
   * PATCH /venues/:venueId/items/:id
   * Update a menu item (name, description, price, imageUrl, sortOrder, categoryId).
   * Partial update — only provided fields are changed.
   */
  @Patch('items/:id')
  async update(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.itemsService.update(venueId, id, userId, dto);
  }

  /**
   * DELETE /venues/:venueId/items/:id
   * Delete a menu item. Returns 204 No Content on success.
   */
  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Param('id') id: string,
  ) {
    const userId = (req.user as { userId: string }).userId;
    await this.itemsService.remove(venueId, id, userId);
  }

  /**
   * PATCH /venues/:venueId/items/:id/availability
   * Toggle item availability — the "86 an item" endpoint (MENU-06).
   * Accepts: { isAvailable: boolean }
   * Updates isAvailable without deleting the item.
   */
  @Patch('items/:id/availability')
  async toggleAvailability(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body() dto: ToggleAvailabilityDto,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.itemsService.toggleAvailability(venueId, id, userId, dto);
  }
}

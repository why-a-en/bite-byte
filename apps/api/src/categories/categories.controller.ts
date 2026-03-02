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
  CategoriesService,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderItem,
} from './categories.service';

/**
 * CategoriesController: menu category management nested under venues.
 *
 * All endpoints are protected by JwtAuthGuard. Venue ownership is verified
 * in the service layer via inline Prisma check.
 *
 * NOTE: The reorder route `PATCH /venues/:venueId/categories/reorder` must
 * be registered BEFORE the `PATCH /venues/:venueId/categories/:id` route so
 * NestJS doesn't treat "reorder" as a dynamic :id parameter.
 */
@Controller('venues/:venueId/categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * POST /venues/:venueId/categories
   * Create a category. Returns 403/404 if venue not owned.
   */
  @Post()
  async create(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.categoriesService.create(venueId, userId, dto);
  }

  /**
   * GET /venues/:venueId/categories
   * List categories for venue, ordered by sortOrder. Includes items.
   */
  @Get()
  async findAll(@Req() req: Request, @Param('venueId') venueId: string) {
    const userId = (req.user as { userId: string }).userId;
    return this.categoriesService.findAll(venueId, userId);
  }

  /**
   * PATCH /venues/:venueId/categories/reorder
   * Bulk-update sortOrder in a transaction (DnD persistence endpoint).
   * Accepts: [{ id: string, sortOrder: number }]
   *
   * IMPORTANT: this route must be declared before PATCH /:id to avoid
   * "reorder" being matched as a dynamic :id value.
   */
  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Body() items: ReorderItem[],
  ) {
    const userId = (req.user as { userId: string }).userId;
    await this.categoriesService.reorder(venueId, userId, items);
  }

  /**
   * PATCH /venues/:venueId/categories/:id
   * Update a category (name, sortOrder).
   */
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.categoriesService.update(venueId, id, userId, dto);
  }

  /**
   * DELETE /venues/:venueId/categories/:id
   * Delete a category. Returns 409 if category has items.
   * Returns 204 No Content on success.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Param('id') id: string,
  ) {
    const userId = (req.user as { userId: string }).userId;
    await this.categoriesService.remove(venueId, id, userId);
  }
}

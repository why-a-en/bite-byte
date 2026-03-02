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
import { VenuesService, CreateVenueDto, UpdateVenueDto } from './venues.service';

/**
 * VenuesController: owner-dashboard CRUD for venue settings.
 *
 * All endpoints are protected by JwtAuthGuard — every request must carry
 * a valid Bearer token. The authenticated user's userId (from JWT payload,
 * set by JwtStrategy.validate) is used to scope all queries.
 */
@Controller('venues')
@UseGuards(JwtAuthGuard)
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  /**
   * POST /venues
   * Create a new venue for the authenticated owner.
   * Returns 201 with the created venue.
   * Returns 409 if slug is already taken.
   */
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateVenueDto) {
    const userId = (req.user as { userId: string }).userId;
    return this.venuesService.create(userId, dto);
  }

  /**
   * GET /venues
   * List all venues owned by the authenticated user.
   */
  @Get()
  async findAll(@Req() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.venuesService.findAllForOwner(userId);
  }

  /**
   * GET /venues/:id
   * Get a single venue by ID — only if owned by the authenticated user.
   * Returns 404 if not found or not owned.
   */
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as { userId: string }).userId;
    return this.venuesService.findOneForOwner(id, userId);
  }

  /**
   * PATCH /venues/:id
   * Update venue settings. Partial update — only provided fields are changed.
   * Returns 409 if new slug is already taken.
   */
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.venuesService.update(id, userId, dto);
  }

  /**
   * DELETE /venues/:id
   * Delete a venue and cascade. Only if owned by the authenticated user.
   * Returns 204 No Content on success.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as { userId: string }).userId;
    await this.venuesService.remove(id, userId);
  }
}

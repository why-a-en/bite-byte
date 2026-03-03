import { Controller, Get, Param } from '@nestjs/common';
import { PublicMenuService } from './public-menu.service';

/**
 * PublicMenuController — NO @UseGuards.
 * All endpoints are public and require no authentication.
 */
@Controller('public/venues/:slug')
export class PublicMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  /**
   * GET /api/public/venues/:slug/menu
   * Returns venue info + categories + items (all items, sorted).
   */
  @Get('menu')
  async getMenu(@Param('slug') slug: string) {
    return this.publicMenuService.getMenuBySlug(slug);
  }
}

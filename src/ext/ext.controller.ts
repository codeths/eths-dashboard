import { Controller, Get, Param } from '@nestjs/common';
import { ExtService } from './ext.service';

@Controller('ext')
export class ExtController {
  constructor(private readonly extService: ExtService) {}

  @Get('status/:id')
  async getStatus(@Param('id') id: string) {
    const { data } = await this.extService.getResponseFromOneToOne(id);
    return data;
  }
}

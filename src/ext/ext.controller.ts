import { Controller, Get, Param, Res } from '@nestjs/common';
import { ExtService } from './ext.service';

@Controller('ext')
export class ExtController {
    constructor(private readonly extService: ExtService) {}

    @Get('status/:id')
    async getStatus(@Res({ passthrough: true }) res: Response, @Param('id') id: string) {
        const { status, data } = await this.extService.getResponseFromOneToOne(id);
        return data;
    }
}

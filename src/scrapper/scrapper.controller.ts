import { Controller, Get, Query } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';

@Controller('scrapper')
export class ScrapperController {
    constructor(
        private scrapperService: ScrapperService
    ) {

    }

    @Get()
    scrapperController(@Query() query) {
        if (!query.url) {
            return {
                message: 'Required URL value',
                status: 500,
            }
        }
        return this.scrapperService.getData(query.url);
    }
}

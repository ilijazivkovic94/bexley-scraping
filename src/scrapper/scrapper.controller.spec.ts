import { Test, TestingModule } from '@nestjs/testing';
import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';

describe('ScrapperController', () => {
  let controller: ScrapperController;
  let service: ScrapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapperController],
      providers: [ScrapperService],
    }).compile();

    service = module.get<ScrapperService>(ScrapperService);
    controller = module.get<ScrapperController>(ScrapperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

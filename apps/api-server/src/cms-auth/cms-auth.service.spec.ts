import { Test, TestingModule } from '@nestjs/testing';
import { CmsAuthService } from './cms-auth.service';

describe('CMSAuthService', () => {
    let service: CmsAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CmsAuthService],
        }).compile();

        service = module.get<CmsAuthService>(CmsAuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

import { Module } from '@nestjs/common';
import { HaService } from './ha.service';

@Module({
  providers: [HaService],
  exports: [HaService],
})
export class HaModule {}
import { Module } from '@nestjs/common';
import { SupportGateway } from './support.gateway.js';
import { SupportService } from './support.service.js';

@Module({
  providers: [SupportGateway, SupportService]
})
export class SupportModule {}

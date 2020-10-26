import { Module } from '@nestjs/common';
import { FacebookResolver } from './facebook.resolver';
import { FacebookService } from './facebook.service';

@Module({
  providers: [FacebookResolver, FacebookService]
})
export class FacebookModule {}

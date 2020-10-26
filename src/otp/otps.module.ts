/**
 * SMS message
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { OtpsService } from "./otps.service";
import { OtpsResolver } from "./otps.resolver";

@Module({
  imports: [],
  providers: [OtpsService, OtpsResolver],
  exports: [OtpsService],
})
export class OtpsModule {}

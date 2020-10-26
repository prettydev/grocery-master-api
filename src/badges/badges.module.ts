import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DateScalar } from "../gql_common/scalars/date.scalar";

import { BadgesController } from "./badges.controller";
import { BadgesResolver } from "./badges.resolver";
import { BadgesService } from "./badges.service";
import { BadgeSchema } from "./db/badge.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Badge", schema: BadgeSchema }]),
  ],
  controllers: [BadgesController],
  providers: [BadgesResolver, BadgesService, DateScalar],
  exports: [BadgesService],
})
export class BadgesModule {}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DateScalar } from "../gql_common/scalars/date.scalar";

import { PointsResolver } from "./points.resolver";
import { PointsService } from "./points.service";
import { PointSchema } from "./db/point.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Point", schema: PointSchema }]),
  ],
  providers: [PointsResolver, PointsService, DateScalar],
  exports: [PointsService],
})
export class PointsModule {}

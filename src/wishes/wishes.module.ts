import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DateScalar } from "../gql_common/scalars/date.scalar";

import { WishesController } from "./wishes.controller";
import { WishesResolver } from "./wishes.resolver";
import { WishesService } from "./wishes.service";
import { WishSchema } from "./db/wish.schema";

import { UsersModule } from "../users/users.module";
import { ExhibitsModule } from "../exhibits/exhibits.module";

@Module({
  imports: [
    UsersModule,
    ExhibitsModule,
    MongooseModule.forFeature([{ name: "Wish", schema: WishSchema }]),
  ],
  controllers: [WishesController],
  providers: [WishesResolver, WishesService, DateScalar],
  exports: [WishesService],
})
export class WishesModule {}

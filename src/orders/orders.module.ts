import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DateScalar } from "../gql_common/scalars/date.scalar";

import { OrdersController } from "./orders.controller";
import { OrdersResolver } from "./orders.resolver";
import { OrdersService } from "./orders.service";
import { OrderSchema } from "./db/order.schema";

import { UsersModule } from "../users/users.module";
import { ExhibitsModule } from "../exhibits/exhibits.module";

@Module({
  imports: [
    UsersModule,
    ExhibitsModule,
    MongooseModule.forFeature([{ name: "Order", schema: OrderSchema }]),
  ],
  controllers: [OrdersController],
  providers: [OrdersResolver, OrdersService, DateScalar],
  exports: [OrdersService],
})
export class OrdersModule {}

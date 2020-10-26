import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DateScalar } from "../gql_common/scalars/date.scalar";

import { ExhibitsResolver } from "./exhibits.resolver";
import { ExhibitsService } from "./exhibits.service";
import { ProductsService } from "./products.service";
import { ExhibitSchema } from "./db/exhibit.schema";
import { MessageSchema } from "./db/message.schema";
import { AuctionSchema } from "./db/auction.schema";
import { HistorySchema } from "./db/history.schema";
import { UserSchema } from "../users/db/user.schema";
import { ProductSchema, CategorySchema } from "./db/product.schema";
import { LoginSchema } from "../logins/db/login.schema";

import { UsersModule } from "../users/users.module";
import { GamificationModule } from "../gamification/gamification.module";

import { SocketModule } from "../socket/socket.module";
import { PubSubModule } from "../pubsub/pubsub.module";
import { NotesModule } from "../notes/notes.module";
import { LoginsModule } from "../logins/logins.module";
import { ExhibitsController } from "./exhibits.controller";

@Module({
  imports: [
    UsersModule,
    GamificationModule,
    SocketModule,
    PubSubModule,
    NotesModule,
    LoginsModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([{ name: "Product", schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: "Category", schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: "Exhibit", schema: ExhibitSchema }]),
    MongooseModule.forFeature([{ name: "Auction", schema: AuctionSchema }]),
    MongooseModule.forFeature([{ name: "History", schema: HistorySchema }]),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: "Login", schema: LoginSchema }]),
  ],
  providers: [ExhibitsResolver, ExhibitsService, ProductsService, DateScalar],
  exports: [ExhibitsService, ProductsService],
  controllers: [ExhibitsController],
})
export class ExhibitsModule {}

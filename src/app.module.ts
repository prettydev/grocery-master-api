import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { MulterModule } from "@nestjs/platform-express";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ExhibitsModule } from "./exhibits/exhibits.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

import { PaypalModule } from "./paypal/paypal.module";
import { OrdersModule } from "./orders/orders.module";
import { WishesModule } from "./wishes/wishes.module";
import { BadgesModule } from "./badges/badges.module";
import { SocketModule } from "./socket/socket.module";

import { RmqModule } from "./rmq/rmq.module";
import { PubSubModule } from "./pubsub/pubsub.module";
import { GamificationModule } from "./gamification/gamification.module";
import { LoginsModule } from "./logins/logins.module";
import { NotesModule } from "./notes/notes.module";
import { FriendsModule } from "./friends/friends.module";
import { FacebookModule } from "./facebook/facebook.module";

import * as dotenv from "dotenv";
dotenv.config();

@Module({
  imports: [
    GraphQLModule.forRoot({
      context: ({ req }) => ({ req }),
      installSubscriptionHandlers: true,
      subscriptions: {
        keepAlive: 1000,
      },
      autoSchemaFile: "schema.gql",
    }),
    MongooseModule.forRoot(process.env.mongodb_url, {
      connectionFactory: (connection) => {
        connection.plugin(require("mongoose-autopopulate"));
        connection.set("useFindAndModify", false);
        return connection;
      },
    }),
    ScheduleModule.forRoot(),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: "/uploads",
      }),
    }),
    ExhibitsModule,
    AuthModule,
    UsersModule,
    PaypalModule,
    OrdersModule,
    WishesModule,
    BadgesModule,
    SocketModule,
    RmqModule,
    PubSubModule,
    GamificationModule,
    LoginsModule,
    NotesModule,
    FriendsModule,
    FacebookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

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

import { PubSubModule } from "./pubsub/pubsub.module";
import { LoginsModule } from "./logins/logins.module";
import { NotesModule } from "./notes/notes.module";

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
    PubSubModule,
    LoginsModule,
    NotesModule,    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

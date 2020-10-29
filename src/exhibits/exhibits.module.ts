import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DateScalar } from "../gql_common/scalars/date.scalar";

import { ExhibitsResolver } from "./exhibits.resolver";
import { ExhibitsService } from "./exhibits.service";
import { GroceriesService } from "./groceries.service";
import { MessageSchema } from "./db/message.schema";
import { UserSchema } from "../users/db/user.schema";
import { GrocerySchema, CategorySchema } from "./db/grocery.schema";
import { LoginSchema } from "../logins/db/login.schema";

import { UsersModule } from "../users/users.module";

import { PubSubModule } from "../pubsub/pubsub.module";
import { NotesModule } from "../notes/notes.module";
import { LoginsModule } from "../logins/logins.module";
import { ExhibitsController } from "./exhibits.controller";

@Module({
  imports: [
    UsersModule,
    PubSubModule,
    NotesModule,
    LoginsModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([{ name: "Grocery", schema: GrocerySchema }]),
    MongooseModule.forFeature([{ name: "Category", schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: "Login", schema: LoginSchema }]),
  ],
  providers: [ExhibitsResolver, ExhibitsService, GroceriesService, DateScalar],
  exports: [ExhibitsService, GroceriesService],
  controllers: [ExhibitsController],
})
export class ExhibitsModule {}

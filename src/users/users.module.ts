import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { NotesModule } from "../notes/notes.module";
import { OtpsModule } from "../otp/otps.module";
import { GamificationModule } from "../gamification/gamification.module";

import { DateScalar } from "../gql_common/scalars/date.scalar";
import { UsersService } from "./users.service";
import { UserSchema } from "./db/user.schema";
import { FriendSchema } from "../friends/db/friend.schema";
import { UsersController } from "./users.controller";
import { UsersResolver } from "./users.resolver";

@Module({
  imports: [
    NotesModule,
    OtpsModule,
    GamificationModule,
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    MongooseModule.forFeature([{ name: "Friend", schema: FriendSchema }]),
  ],
  providers: [UsersService, DateScalar, UsersResolver],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

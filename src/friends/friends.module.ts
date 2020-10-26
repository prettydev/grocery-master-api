import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { FriendsResolver } from "./friends.resolver";
import { FriendsService } from "./friends.service";
import { FriendSchema } from "./db/friend.schema";
import { UserSchema } from "../users/db/user.schema";
import { PubSubModule } from "../pubsub/pubsub.module";
import { GamificationModule } from "../gamification/gamification.module";

@Module({
  imports: [
    PubSubModule,
    GamificationModule,
    MongooseModule.forFeature([{ name: "Friend", schema: FriendSchema }]),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
  ],
  providers: [FriendsResolver, FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}

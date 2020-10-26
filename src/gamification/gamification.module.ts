import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GamificationService } from "./gamification.service";
import { GamificationResolver } from "./gamification.resolver";

import { AuctionSchema } from "../exhibits/db/auction.schema";
import { HistorySchema } from "../exhibits/db/history.schema";
import { UserSchema } from "../users/db/user.schema";
import { BadgeSchema } from "../badges/db/badge.schema";
import { PointSchema } from "../points/db/point.schema";
import { LoginSchema } from "../logins/db/login.schema";
import { NoteSchema } from "../notes/db/note.schema";

import { BadgesModule } from "../badges/badges.module";
import { PointsModule } from "../points/points.module";
import { LoginsModule } from "../logins/logins.module";

import { PubSubModule } from "../pubsub/pubsub.module";
import { NotesModule } from "../notes/notes.module";

@Module({
  imports: [
    BadgesModule,
    PointsModule,
    LoginsModule,
    PubSubModule,
    NotesModule,
    MongooseModule.forFeature([{ name: "Auction", schema: AuctionSchema }]),
    MongooseModule.forFeature([{ name: "History", schema: HistorySchema }]),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    MongooseModule.forFeature([{ name: "Badge", schema: BadgeSchema }]),
    MongooseModule.forFeature([{ name: "Point", schema: PointSchema }]),
    MongooseModule.forFeature([{ name: "Login", schema: LoginSchema }]),
    MongooseModule.forFeature([{ name: "Note", schema: NoteSchema }]),
  ],
  providers: [GamificationService, GamificationResolver],
  exports: [GamificationService],
})
export class GamificationModule {}

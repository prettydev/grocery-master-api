/**
 * Email, Site Notification
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { NotesService } from "./notes.service";
import { NotesResolver } from "./notes.resolver";

import { UserSchema } from "../users/db/user.schema";
import { NoteSchema } from "../notes/db/note.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    MongooseModule.forFeature([{ name: "Note", schema: NoteSchema }]),
  ],
  providers: [NotesService, NotesResolver],
  exports: [NotesService],
})
export class NotesModule {}

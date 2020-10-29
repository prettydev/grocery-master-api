import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { NotesModule } from "../notes/notes.module";
import { OtpsModule } from "../otp/otps.module";

import { DateScalar } from "../gql_common/scalars/date.scalar";
import { UsersService } from "./users.service";
import { UserSchema } from "./db/user.schema";
import { UsersController } from "./users.controller";
import { UsersResolver } from "./users.resolver";

@Module({
  imports: [
    NotesModule,
    OtpsModule,
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),    
  ],
  providers: [UsersService, DateScalar, UsersResolver],
  exports: [UsersService],
  controllers: [UsersController],
})
  
export class UsersModule {}

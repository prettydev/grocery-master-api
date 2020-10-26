import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DateScalar } from "../gql_common/scalars/date.scalar";

import { LoginsService } from "./logins.service";
import { LoginSchema } from "./db/login.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Login", schema: LoginSchema }]),
  ],
  providers: [LoginsService, DateScalar],
  exports: [LoginsService],
})
export class LoginsModule {}

/**
 * Rest API for user registration and login
 */

import { Controller, Post, Body, Param, Get, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { NewUserInput, LoginUserInput } from "./gql/new-user.input";
import { IUser, IFetchUser } from "./db/user.interface";
import { PageArgs, Filter } from "src/gql_common/types/common.input";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("/register")
  async register(
    @Body("user") user: NewUserInput,
    @Body("ref") ref: string,
  ): Promise<IUser> {
    const result = await this.usersService.create(user, ref);
    return result;
  }

  @Post("/login")
  async login(@Body("user") user: LoginUserInput): Promise<IUser> {
    const result = await this.usersService.login(user);
    return result;
  }

  @Post("/leaders")
  async leaders(
    @Body("pageArgs") pageArgs: PageArgs,
    @Body("filter") filter: Filter,
  ): Promise<IFetchUser> {
    return await this.usersService.findLeaders(pageArgs, filter);
  }

  @Get("/mailAuth")
  async mailAuth(@Query("token") token: string): Promise<string> {
    const auth_result = await this.usersService.authProc(token);
    if (!auth_result) {
      return "Failed to authenticate.";
    }
    return "Success, sign with the email";
  }
}

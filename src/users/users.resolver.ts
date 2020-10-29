import { NotFoundException, Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { ResType } from "src/gql_common/types/common.object";
import { PageArgs, Filter } from "../gql_common/types/common.input";
import { UserType, FetchUserType } from "./gql/user.dto";
import { UsersService } from "./users.service";

// @Resolver('Users')
@Resolver((of) => UserType)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject("PUB_SUB") private pubSub: PubSub,
  ) {}

  @Mutation((returns) => ResType)
  async verifySMS(
    @Args("user_id") user_id: string,
    @Args("token") token: string,
  ): Promise<ResType> {
    console.log("received the verification code:", token, "from user_id:", user_id);
    return await this.usersService.smsProc(token);
  }  
}

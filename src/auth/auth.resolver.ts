import { Inject, Logger } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";

import { GraphQLUpload, FileUpload } from "graphql-upload";
import { createWriteStream } from "fs";

import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginsService } from "../logins/logins.service";
import { UserType, UserResult } from "../users/gql/user.dto";
import { ResType } from "../gql_common/types/common.object";
import {
  NewUserInput,
  LoginUserInput,
  Social,
} from "../users/gql/new-user.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly loginsService: LoginsService,
    @Inject("PUB_SUB") private pubSub: PubSub, // @Inject("MQ_PUB") private mqPub: ClientProxy,
  ) {}

  @Subscription((returns) => UserType)
  userAdded() {
    return this.pubSub.asyncIterator("userAdded");
  }

  @Subscription((returns) => UserType, {
    filter: (payload, variables) =>
      payload.userUpdated.id === variables.user_id,
  })
  userUpdated(@Args("user_id") user_id: string) {
    ////////////////need to insert login log////////////
    if (user_id.length === 24) {
      this.logger.verbose(`${user_id}==>user subscribed`);
      this.loginsService.create(user_id);
    }
    return this.pubSub.asyncIterator("userUpdated");
  }

  @Query((returns) => UserType)
  async user(@Args("id") id: string): Promise<UserType> {
    return await this.usersService.findOneById(id);
  }

  /**
   * @param pageArgs
   * @param filter
   */
  @Query((returns) => [UserType])
  async users(
    @Args() pageArgs: PageArgs,
    @Args() filter: Filter,
  ): Promise<NewUserInput[]> {
    return this.usersService.findAll(pageArgs, filter);
  }

  @Mutation((returns) => Boolean)
  async removeUser(@Args("id") id: string) {
    return this.usersService.remove(id);
  }

  @Query((returns) => UserResult)
  async login(@Args("user") user: LoginUserInput): Promise<UserResult> {
    const userUpdated = await this.authService.validateUser(
      user.email,
      user.password,
    );

    if (!userUpdated) {
      return { user: null, message: "error" };
    }

    return { user: userUpdated, message: "success" };
  }

  @Mutation((returns) => Boolean)
  async register(
    @Args("user") newUserData: NewUserInput,
    @Args({
      name: "ref",
      type: () => String,
      nullable: true,
    })
    ref: string,
  ): Promise<boolean> {
    
    const userAdded = await this.usersService.create(newUserData, ref);

    if (!userAdded) {
      return false;
    }

    return true;
  }

  @Mutation((returns) => Boolean)
  async changeAvatar(
    @Args("user_id") user_id: string,
    @Args("avatar") avatar: string,
  ): Promise<boolean> {
    const userUpdated = await this.usersService.changeAvatar(user_id, avatar);
    if (!userUpdated) {
      return false;
    }

    this.pubSub.publish("userUpdated", { userUpdated });
    return true;
  }

  /**
   * called from the profile page
   * @param user_id
   * @param social
   */
  @Mutation((returns) => Boolean)
  async addSocial(
    @Args("user_id") user_id: string,
    @Args("social") social: Social,
  ): Promise<boolean> {
    const userUpdated = await this.usersService.addSocial(user_id, social);
    if (!userUpdated) {
      return false;
    }

    this.pubSub.publish("userUpdated", { userUpdated });
    return true;
  }

  /**
   * called from the auth page
   * @param social
   */
  @Mutation((returns) => UserResult)
  async socialRegisterLogin(
    @Args("social") social: Social,
  ): Promise<UserResult> {
    const userUpdated = await this.usersService.socialRegisterLogin(social);
    if (!userUpdated) {
      return { user: null, message: "error" };
    }

    return { user: userUpdated, message: "success" };
  }

  @Mutation((returns) => ResType)
  async changePassword(
    @Args("user_id") user_id: string,
    @Args("current_password") current_password: string,
    @Args("password") password: string,
  ): Promise<ResType> {
    const current_user = await this.usersService.validateUser(
      user_id,
      current_password,
    );

    if (!current_user)
      return { code: "error", message: "Wrong current password!" };

    const userUpdated = await this.usersService.changePassword(
      user_id,
      password,
    );

    if (!userUpdated)
      return { code: "error", message: "Failed to update the password!" };

    return { code: "success", message: "The password updated successfully!" };
  }

  @Mutation((returns) => Boolean)
  async exchange(
    @Args("user_id") user_id: string,
    @Args("coins") coins: number,
  ): Promise<boolean> {
    const userUpdated = await this.usersService.exchange(user_id, coins);
    if (!userUpdated) {
      return false;
    }

    this.pubSub.publish("userUpdated", { userUpdated });
    return true;
  }

  @Mutation((returns) => Boolean)
  async updatePlan(
    @Args("plan_name") plan_name: string,
    @Args("user_id") user_id: string,
  ): Promise<boolean> {
    const userUpdated = await this.usersService.updatePlan(
      plan_name,
      user_id,
    );
    if (!userUpdated) {
      return false;
    }

    this.pubSub.publish("userUpdated", { userUpdated });

    return true;
  }

  /**
   * Not used
   * @param param0
   */
  @Mutation(() => Boolean)
  async uploadFile(
    @Args({ name: "file", type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(`./uploads/${filename}`))
        .on("finish", () => resolve(true))
        .on("error", () => reject(false)),
    );
  }
}

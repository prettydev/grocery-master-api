import { NotFoundException, Inject, Logger } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { PageArgs, Filter } from "../gql_common/types/common.input";
import { WishType, WishUserType, FetchWishType } from "./gql/wish.dto";
import { NewWishInput } from "./gql/new-wish.input";
import { WishesService } from "./wishes.service";
import { UsersService } from "../users/users.service";

import { IChannel } from "../users/db/user.interface";

// @Resolver("Orders")
@Resolver((of) => WishType)
export class WishesResolver {
  private readonly logger = new Logger(WishesResolver.name);
  constructor(
    private readonly wishesService: WishesService,
    @Inject("PUB_SUB") private pubSub: PubSub,
    private usersService: UsersService,
  ) {}

  @Mutation((returns) => Boolean)
  async addWish(
    @Args("input") input: NewWishInput,
    @Args({ name: "note_channels", type: () => [String] })
    note_channels: [IChannel],
  ): Promise<boolean> {
    const wishAdded = await this.wishesService.create(input);
    const userUpdated = await this.usersService.changeNoteChannels(
      input.user,
      note_channels,
    );
    if (userUpdated) {
      this.pubSub.publish("userUpdated", { userUpdated });
    }
    return wishAdded ? true : false;
  }

  @Mutation((returns) => Boolean)
  async removeWish(@Args("input") input: NewWishInput): Promise<boolean> {
    console.log("newWishInput:", input);
    await this.wishesService.remove(input);
    return true;
  }

  @Query((returns) => FetchWishType)
  wishes(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
    @Args("user_id") user_id: string,
  ): Promise<FetchWishType> {
    return this.wishesService.findAll(pageArgs, filter, user_id);
  }

  @Query((returns) => [String])
  mywishes(@Args("user_id") user_id: string): Promise<string[]> {
    if (user_id.length === 24) {
      return this.wishesService.findAllMy(user_id);
    } else {
      return null;
    }
  }
}

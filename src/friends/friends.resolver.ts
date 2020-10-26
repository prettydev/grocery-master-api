import { NotFoundException, Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { PageArgs, Filter } from "../gql_common/types/common.input";
import { FriendType, FetchFriendType } from "./gql/friend.dto";
import { NewFriendInput } from "./gql/new-friend.input";
import { FriendsService } from "./friends.service";

// @Resolver('Friends')
@Resolver((of) => FriendType)
export class FriendsResolver {
  constructor(
    private readonly friendsService: FriendsService,
    @Inject("PUB_SUB") private pubSub: PubSub,
  ) {}

  @Mutation((returns) => Boolean)
  async requestFriend(
    @Args("input") newFriendInput: NewFriendInput,
  ): Promise<boolean> {
    const req_res = await this.friendsService.create(newFriendInput);
    return req_res;
  }

  @Mutation((returns) => Boolean)
  async denyFriend(@Args("id") id: string): Promise<boolean> {
    console.log("deny from the client:", id);

    const req_res = await this.friendsService.deny(id);
    return req_res;
  }

  @Mutation((returns) => Boolean)
  async confirmFriend(@Args("id") id: string): Promise<boolean> {
    console.log("confirm from the client:", id);

    const friend = await this.friendsService.findOne(id);

    if (!friend) {
      return false;
    }

    await this.friendsService.remove(id);

    const senderUpdated = await this.friendsService.updateFriend(
      friend.sender.id,
      friend.receiver.id,
    );
    const receiverUpdated = await this.friendsService.updateFriend(
      friend.receiver.id,
      friend.sender.id,
    );

    return senderUpdated && receiverUpdated ? true : false;
  }

  @Query((returns) => FetchFriendType)
  async sentFriendRequests(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
    @Args("user_id") user_id: string,
  ): Promise<FetchFriendType> {
    if (!user_id) {
      return null;
    }
    const res = await this.friendsService.findSentRequests(
      pageArgs,
      filter,
      user_id,
    );
    return res;
  }

  @Query((returns) => FetchFriendType)
  async recvFriendRequests(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
    @Args("user_id") user_id: string,
  ): Promise<FetchFriendType> {
    if (!user_id) {
      return null;
    }
    const res = await this.friendsService.findRecvRequests(
      pageArgs,
      filter,
      user_id,
    );
    return res;
  }
}

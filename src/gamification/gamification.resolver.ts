import { NotFoundException, Inject, Logger } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";

import { GameType } from "../exhibits/gql/exhibit.dto";

@Resolver()
export class GamificationResolver {
  private readonly logger = new Logger(GamificationResolver.name);

  constructor(
    @Inject("PUB_SUB") private pubSub: PubSub, // @Inject("MQ_PUB") private mqPub: ClientProxy,
  ) {}

  @Subscription((returns) => GameType, {
    filter: (payload, variables) =>
      //payload.gameUpdated.userUpdated.id === variables.user_id,//send to the only awarded user
      true, //send to all
  })
  gameUpdated(@Args("user_id") user_id: string) {
    if (user_id) this.logger.verbose(`${user_id}==>game subscribed`);
    return this.pubSub.asyncIterator("gameUpdated");
  }
}

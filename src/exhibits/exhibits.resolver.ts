import { NotFoundException, Inject, Logger } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";

import {
  MessageInput,
} from "./gql/fund-exhibit.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";

import {
  ExhibitType,
  FetchProductType,
  AuctionTimeType,
  MessageType,
  CurrentStatisticsType,
  HistoryStatisticsType,
} from "./gql/exhibit.dto";
import { ExhibitsService } from "./exhibits.service";
import { GroceriesService } from "./groceries.service";
import { GroceryInput as GroceryInput } from "./gql/grocery.input";

@Resolver()
export class ExhibitsResolver {
  private readonly logger = new Logger(ExhibitsService.name);

  constructor(
    private readonly exhibitsService: ExhibitsService,
    private readonly groceriesService: GroceriesService,
    @Inject("PUB_SUB") private pubSub: PubSub, // @Inject("MQ_PUB") private mqPub: ClientProxy,
  ) {}

  @Subscription((returns) => MessageType, {
    filter: (payload, variables) =>
      // payload.messageAdded.room_id === variables.room_id &&
      payload.messageAdded.user_id !== variables.user_id,
  })
  messageAdded(
    @Args("room_id") room_id: string,
    @Args("user_id") user_id: string,
  ) {
    if (user_id && room_id)
      this.logger.verbose(
        `${user_id}==>user is subscribing ${room_id}'s messages`,
      );
    return this.pubSub.asyncIterator("messageAdded");
  }

  @Mutation((returns) => Boolean)
  async addMessage(@Args("message") message: MessageInput): Promise<boolean> {
    message.created_at = new Date(); //set server time;
    this.pubSub.publish("messageAdded", { messageAdded: message });
    return this.exhibitsService.createMessage(message);
  }

  @Query((returns) => [MessageType])
  messages(): Promise<MessageType[]> {
    return this.exhibitsService.findMessages();
  }

  @Query((returns) => FetchProductType)
  groceries(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchProductType> {
    return this.groceriesService.findAll(pageArgs, filter);
  }

  @Mutation((returns) => Boolean)
  async add_grocery(
    @Args("grocery") grocery: GroceryInput,
  ): Promise<boolean> {
    return await this.groceriesService.add_grocery(grocery);
  }  
}

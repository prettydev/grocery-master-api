import { NotFoundException, Inject, Logger } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";

import {
  FundExhibitInput,
  SetThresholdInput,
  SetCampaignInput,
  SetReservedInput,
  SetTimerInput,
  BidAuctionInput,
  AutoAuctionInput,
  MessageInput,
} from "./gql/fund-exhibit.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";

import {
  ExhibitType,
  FetchProductType,
  FetchExhibitType,
  FetchAuctionType,
  FetchHistoryType,
  AuctionType,
  AuctionTimeType,
  MessageType,
  HistoryProductType,
  AuctionProductType,
  ExhibitProductType,
  CurrentStatisticsType,
  HistoryStatisticsType,
} from "./gql/exhibit.dto";
import { ExhibitsService } from "./exhibits.service";
import { GroceriesService } from "./groceries.service";
import { GroceryInput as GroceryInput } from "./gql/grocery.input";
import { ResType } from "src/gql_common/types/common.object";

@Resolver()
export class ExhibitsResolver {
  private readonly logger = new Logger(ExhibitsService.name);

  constructor(
    private readonly exhibitsService: ExhibitsService,
    private readonly groceriesService: GroceriesService,
    @Inject("PUB_SUB") private pubSub: PubSub, // @Inject("MQ_PUB") private mqPub: ClientProxy,
  ) {}

  @Subscription((returns) => ExhibitType, {
    filter: (payload, variables) =>
      payload.exhibitUpdated.id === variables.exhibit_id,
  })
  exhibitUpdated(@Args("exhibit_id") exhibit_id: string) {
    if (exhibit_id) this.logger.verbose(`${exhibit_id}==>exhibit subscribed`);
    return this.pubSub.asyncIterator("exhibitUpdated");
  }

  @Subscription((returns) => AuctionTimeType, {
    filter: (payload, variables) => 
      payload.auctionUpdated.auction.id === variables.auction_id
  })
  auctionUpdated(@Args("auction_id") auction_id: string) {
    if (auction_id) this.logger.verbose(`${auction_id}==>auction subscribed`);
    return this.pubSub.asyncIterator("auctionUpdated");
  }

  //////////////////////////////----- chat-----//////////////////////////////

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

  @Query((returns) => FetchExhibitType)
  exhibits(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchExhibitType> {
    return this.exhibitsService.findExhibitsAll(pageArgs, filter);
  }

  @Query((returns) => [ExhibitType])
  top_exhibits(): Promise<ExhibitType[]> {
    return this.exhibitsService.findTop();
  }

  @Mutation((returns) => ExhibitType)
  async setThreshold(
    @Args("threshold") threshold: SetThresholdInput,
  ): Promise<ExhibitType> {
    const exhibit = await this.exhibitsService.setThreshold(
      threshold.exhibit_id,
      threshold.threshold,
    );
    // pubSub.publish("exhibitAdded", { aucitonAdded: exhibit });
    return exhibit;
  }

  @Mutation((returns) => Boolean)
  async removeExhibit(@Args("id") id: string) {
    return this.exhibitsService.removeExhibit(id);
  }

  ////////////////------------for auctions---------------//////////////////////////////

  @Query((returns) => FetchAuctionType)
  auctions(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchAuctionType> {
    return this.exhibitsService.auctions(pageArgs, filter);
  }

  @Query((returns) => AuctionType)
  last_auction(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<AuctionType> {
    return this.exhibitsService.findLastAuction(pageArgs, filter);
  }

  @Query((returns) => FetchAuctionType)
  admin_auctions(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchAuctionType> {
    return this.exhibitsService.auctions(pageArgs, filter); //findAdminAuctionsAll
  }

  @Query((returns) => Boolean)
  async getAuctionLiveTimer(
    @Args("auction_id") auction_id: string,
  ): Promise<boolean> {
    const auctionUpdated = await this.exhibitsService.findLiveAuctionById(
      auction_id,
    );

    if (!auctionUpdated) {
      return false;
    }

    this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: auctionUpdated, timestamp: new Date().getTime() }});

    return true;
  }

  @Mutation((returns) => AuctionType)
  async setCampaign(
    @Args("campaign") campaign: SetCampaignInput,
  ): Promise<AuctionType> {
    const auction = await this.exhibitsService.setCampaign(
      campaign.auction_id,
      campaign.campaign,
    );
    // pubSub.publish("auctionAdded", { aucitonAdded: auction });
    return auction;
  }

  @Mutation((returns) => Boolean)
  async setReserved(
    @Args("reserved") reserved: SetReservedInput,
  ): Promise<boolean> {
    const auctionUpdated = await this.exhibitsService.setReserved(
      reserved.auction_id,
      reserved.value,
    );
    if (!auctionUpdated) return false;

    return true;
  }

  @Mutation((returns) => Boolean)
  async setExhibitManual(
    @Args("manual") manual: number,
    @Args("exhibit_id") exhibit_id: string,
  ): Promise<boolean> {
    const exhibitUpdated = await this.exhibitsService.setExhibitManual(
      manual,
      exhibit_id,
    );
    if (!exhibitUpdated) return false;

    return true;
  }

  @Mutation((returns) => Boolean)
  async setAuctionManual(
    @Args("manual") manual: number,
    @Args("auction_id") auction_id: string,
  ): Promise<boolean> {
    const auctionUpdated = await this.exhibitsService.setAuctionManual(
      manual,
      auction_id,
    );
    if (!auctionUpdated) return false;

    return true;
  }

  @Mutation((returns) => Boolean)
  async setTimer(@Args("input") input: SetTimerInput): Promise<boolean> {
    const auctionUpdated = await this.exhibitsService.setTimer(
      input.auction_id,
      input.timer,
    );

    if (!auctionUpdated) return false;

    return true;
  }

  @Mutation((returns) => Boolean)
  async bid(@Args("input") bidAuctionInput: BidAuctionInput): Promise<boolean> {
    const { auction, user } = await this.exhibitsService.bid(bidAuctionInput);

    if (!auction || !user) {
      return false;
    }

    return true;
  }

  @Mutation((returns) => Boolean)
  async auto(
    @Args("input") autoAuctionInput: AutoAuctionInput,
  ): Promise<boolean> {
    const auctionUpdated = await this.exhibitsService.auto(autoAuctionInput);

    if (!auctionUpdated) {
      return false;
    }

    return true;
  }

  ///////////////////////--------------for histories-------------------////////////////////
  @Query((returns) => FetchHistoryType)
  histories(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchHistoryType> {
    return this.exhibitsService.findHistoriesAll(pageArgs, filter);
  }

  //////////////////////-----------------for statistics-----------------//////////////////////

  @Subscription((returns) => CurrentStatisticsType)
  currentUpdated() {
    return this.pubSub.asyncIterator("currentUpdated");
  }

  @Subscription((returns) => HistoryStatisticsType)
  historyUpdated() {
    return this.pubSub.asyncIterator("historyUpdated");
  }

  @Query((returns) => CurrentStatisticsType)
  currentStatistics(): Promise<CurrentStatisticsType> {
    return this.exhibitsService.currentStatistics();
  }

  @Query((returns) => HistoryStatisticsType)
  historyStatistics(): Promise<HistoryStatisticsType> {
    return this.exhibitsService.historyStatistics();
  }

  ///////////////////////admin////////////////////////////////////////////

  @Query((returns) => FetchProductType)
  admin_products(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchProductType> {
    return this.groceriesService.findAdminProductsAll(pageArgs, filter);
  }

  @Query((returns) => FetchHistoryType)
  admin_completed_auctions(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchHistoryType> {
    return this.exhibitsService.findAdminCompletedAuctionsAll(pageArgs, filter);
  }

  @Mutation((returns) => ResType)
  async admin_add_tracking(
    @Args("id") id: string,
    @Args("tracking") tracking: string,
  ): Promise<ResType> {
    return await this.exhibitsService.setTracking(id, tracking);
  }

  @Mutation((returns) => Boolean)
  async add_grocery(
    @Args("grocery") grocery: GroceryInput,
  ): Promise<boolean> {
    console.log("grocery on the resolver: ", grocery);
    return await this.groceriesService.add_grocery(grocery);
  }  
}

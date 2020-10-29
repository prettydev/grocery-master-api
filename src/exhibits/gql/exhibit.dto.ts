import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { GroceryType } from "./grocery.dto";
import { SimpleProductType } from "../../gql_common/types/common.object";
import { UserType } from "../../users/gql/user.dto";

@ObjectType()
export class FunderType {
  @Field()
  user: UserType;

  @Field()
  amount: number;

  @Field({ nullable: true })
  payer: string;

  @Field({ nullable: true })
  pay_order_id: string;
}

@ObjectType()
export class ExhibitType {
  @Field((type) => ID)
  id: string;

  @Field((type) => SimpleProductType)
  product: SimpleProductType;

  @Field((type) => [FunderType], { nullable: true })
  funders: FunderType[];

  @Field()
  fund_amount: number;

  @Field()
  fund_percent: number;

  @Field()
  threshold: number;

  @Field()
  manual: number;
}

@ObjectType()
export class FetchExhibitType {
  @Field((type) => [ExhibitType])
  arr: ExhibitType[];

  @Field()
  cnt: number;
}

@ObjectType()
export class ExhibitUserType {
  @Field((type) => ExhibitType)
  exhibit: ExhibitType;

  @Field((type) => UserType)
  user: UserType;
}

//-------------------------------------For Auctions----------------------------------------------

@ObjectType()
export class UserValueType {
  @Field()
  user: UserType;

  @Field()
  value: number;
}

@ObjectType()
export class AutoValueType {
  @Field()
  user: UserType;

  @Field()
  value: number;

  @Field()
  active: boolean;
}

@ObjectType()
export class AuctionType {
  //-------------------------------------must be same with ExhibitType----------------------------
  @Field((type) => ID)
  id: string;

  @Field((type) => SimpleProductType)
  product: SimpleProductType;

  @Field((type) => [FunderType], { nullable: true })
  funders: FunderType[];

  @Field()
  fund_amount: number;

  @Field()
  fund_percent: number;

  @Field()
  threshold: number;

  //-------------------------------------auction specific fields-------------------------------------

  @Field((type) => [AutoValueType], { nullable: true })
  autos: AutoValueType[];

  @Field((type) => [UserValueType], { nullable: true })
  bidders: UserValueType[];

  @Field((type) => [String], { nullable: true })
  watchers: string[];

  @Field((type) => [String], { nullable: true })
  chatters: string[];

  @Field()
  state: string; //ready/cool/warmer/warmest/hot/hotter/dutch/hottest

  @Field()
  timer: number;

  @Field({ nullable: true })
  live_timer?: number;

  @Field({ nullable: true })
  bid_speed?: number;

  @Field()
  campaign: boolean; //campaign state

  @Field()
  reserved: boolean;

  @Field()
  manual: number;

  @Field()
  bid_started_at: Date;

  @Field()
  bid_ended_at: Date;
}

@ObjectType()
export class FetchAuctionType {
  @Field((type) => [AuctionType])
  arr: AuctionType[];

  @Field()
  cnt: number;

  @Field()
  timestamp: number;
}

@ObjectType()
export class AuctionTimeType {
  @Field((type) => AuctionType)
  auction: AuctionType;

  @Field((type)=>Float)
  timestamp: number;
}

//////////////////------------------history specific----------------------////////////////////

@ObjectType()
export class HistoryType {
  //-------------------------------------must be same with ExhibitType----------------------------
  @Field((type) => ID)
  id: string;

  @Field((type) => SimpleProductType)
  product: SimpleProductType;

  @Field((type) => [FunderType], { nullable: true })
  funders: FunderType[];

  @Field()
  fund_amount: number;

  @Field()
  fund_percent: number;

  @Field()
  threshold: number;

  //-------------------------------------auction specific fields-------------------------------------

  @Field((type) => [UserValueType], { nullable: true })
  autos: UserValueType[];

  @Field((type) => [UserValueType], { nullable: true })
  bidders: UserValueType[];

  @Field((type) => [String], { nullable: true })
  watchers: string[];

  @Field((type) => [String], { nullable: true })
  chatters: string[];

  @Field()
  state: string; //ready/cool/warmer/warmest/hot/hotter/dutch/hottest

  @Field()
  timer: number;

  @Field({ nullable: true })
  live_timer?: number;

  @Field({ nullable: true })
  bid_speed?: number;

  @Field()
  campaign: boolean; //campaign state

  @Field()
  reserved: boolean;

  @Field()
  manual: number;

  @Field()
  bid_started_at: Date;

  @Field()
  bid_ended_at: Date;

  /////////////////////-----------history---------------///////////////////////

  @Field((type) => UserType, { nullable: true })
  winner: UserType;

  @Field()
  end_bids: number;

  @Field({ nullable: true })
  tracking?: string;
}

@ObjectType()
export class ExhibitProductType {
  @Field((type) => ExhibitType)
  exhibit: ExhibitType;

  @Field((type) => GroceryType)
  product: GroceryType;
}

@ObjectType()
export class AuctionProductType {
  @Field((type) => AuctionType)
  auction: AuctionType;

  @Field((type) => GroceryType)
  product: GroceryType;
}

@ObjectType()
export class HistoryProductType {
  @Field((type) => HistoryType)
  history: HistoryType;

  @Field((type) => GroceryType)
  product: GroceryType;
}

@ObjectType()
export class FetchHistoryType {
  @Field((type) => [HistoryType])
  arr: HistoryType[];

  @Field()
  cnt: number;
}

@ObjectType()
export class HistoryUserType {
  @Field((type) => HistoryType)
  history: HistoryType;

  @Field((type) => UserType)
  user: UserType;
}

@ObjectType()
export class HistoryResultType {
  @Field((type) => HistoryType)
  history: HistoryType;

  @Field((type) => String)
  message: string;
}

/**
 * public chat message type
 */
@ObjectType()
export class MessageType {
  @Field()
  room_id: string; //auction_id or public

  @Field() //sender
  user_id: string;

  @Field() //sender username or email
  username: string;

  @Field()
  avatar: string;

  @Field()
  content: string;

  @Field()
  created_at: Date;
}

@ObjectType()
export class NoteType {
  @Field()
  noteUpdated: string;

  @Field((type) => [String])
  receivers: string[];
}

@ObjectType()
export class CurrentStatisticsType {
  @Field()
  online_users: number;
  @Field()
  online_bid_users: number;
  @Field()
  bids_per_action: number;
}

@ObjectType()
export class HistoryStatisticsType {
  @Field()
  total_actions: number;
  @Field()
  total_winners: number;
  @Field()
  max_users: number;
  @Field()
  bids_per_action: number;
}

@ObjectType()
export class FetchGroceryType {
  @Field((type) => [GroceryType])
  arr: GroceryType[];

  @Field()
  cnt: number;
}

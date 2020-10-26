import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, Length, MaxLength } from "class-validator";

@InputType()
export class FundExhibitInput {
  @Field()
  exhibit_id: string;

  @Field((type) => String)
  user: string;

  @Field()
  amount: number;

  @Field()
  payer: string;

  @Field()
  pay_order_id: string;
}

@InputType()
export class SetThresholdInput {
  @Field()
  exhibit_id: string;

  @Field()
  threshold: number;
}

@InputType()
export class SetCampaignInput {
  @Field()
  auction_id: string;

  @Field()
  campaign: boolean;
}

@InputType()
export class SetReservedInput {
  @Field()
  auction_id: string;

  @Field()
  value: boolean;
}

@InputType()
export class SetTimerInput {
  @Field()
  auction_id: string;

  @Field()
  timer: number;
}

@InputType()
export class BidAuctionInput {
  @Field()
  auction_id: string;

  @Field((type) => String)
  user: string;

  @Field()
  value: number;
}

@InputType()
export class AutoAuctionInput {
  @Field()
  auction_id: string;

  @Field((type) => String)
  user: string;

  @Field()
  value: number;

  @Field()
  active: boolean;
}

@InputType()
export class MessageInput {
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

import { Document, Schema } from "mongoose";
import { IUser } from "../../users/db/user.interface";

export type TState =
  | "ready"
  | "cool"
  | "warmer"
  | "warmest"
  | "hot"
  | "hotter"
  | "dutch"
  | "hottest"
  | "end";

export interface ISimpleProduct {
  id: string;
  title: string;
  asin: string;
  link: string;
  category: Array<string>;
  image: string;
  rating: number;
  price: number;
}

export interface IFunder {
  user: IUser;
  amount: number;
  payer: string;
  pay_order_id: string;
}

export interface IExhibit extends Document {
  id: string;
  product: ISimpleProduct;
  funders: [IFunder];
  fund_amount: number;
  fund_percent: number;
  threshold: number;

  created_at: Date;
  updated_at: Date;
  manual: number;
}

export interface IFetchExhibit {
  arr: IExhibit[];
  cnt: number;
}

export interface IExhibitUser {
  exhibit: IExhibit;
  user: IUser;
}
//------------------------------for auctions--------------------------------------------
/**
 * Defined here to easily manage relative to the IExhibit
 */

export interface IUserValue {
  user: IUser;
  value: number;
}
export interface IAutoValue {
  user: IUser;
  value: number;
  active: boolean;
}
export interface IAuction extends Document {
  // ---------must be the same as IExhibit---------------//
  id: string;
  product: ISimpleProduct;
  funders: [IFunder];
  fund_amount: number;
  fund_percent: number;
  threshold: number;

  // ---------auction specific fields---------------//

  autos: [IAutoValue]; //value is the auto limit
  bidders: [IUserValue]; //
  watchers: string[];
  chatters: string[];
  state: string; //ready / cool / warmer / warmest / hot / hotter / dutch / hottest/end
  timer: number;
  live_timer: number;
  bid_speed: number;
  campaign: boolean;
  reserved: boolean;
  manual: number;

  bid_started_at: Date;
  bid_ended_at: Date;

  //////////////////////////////////////////////////////////////////////////////////////

  created_at: Date;
  updated_at: Date;
}
export interface IFetchAuction {
  arr: IAuction[];
  cnt: number;
  timestamp: number;
}
export interface IAuctionUser {
  auction: IAuction;
  user: IUser;
}

///////////////////////---------------for history--------------//////////////////////

export interface IHistory extends Document {
  // ---------must be the same as IExhibit---------------//
  id: string;
  product: ISimpleProduct;
  funders: [IFunder];
  fund_amount: number;
  fund_percent: number;
  threshold: number;

  // ---------auction specific fields---------------//

  autos: [IAutoValue]; //value is the auto limit
  bidders: [IUserValue]; //
  watchers: string[];
  chatters: string[];
  state: string; //ready / cool / warmer / warmest / hot / hotter / dutch / hottest/end
  timer: number;
  live_timer: number;
  bid_speed: number;
  campaign: boolean;
  reserved: boolean;  
  manual: number;

  bid_started_at: Date;
  bid_ended_at: Date;

  //////////////////////////////////////////////////////////////////////////////////////

  created_at: Date;
  updated_at: Date;
  // ---------history specific fields---------------//

  winner: IUser;
  end_bids: number;
  tracking: string;
}
export interface IFetchHistory {
  arr: IHistory[];
  cnt: number;
}
export interface IHistoryUser {
  history: IHistory;
  user: IUser;
}
export interface IHistoryResult {
  history: IHistory;
  message: string;
}

export interface IMessage extends Document {
  room_id: string;
  user_id: string;
  username: string;
  avatar: string;
  content: string;
  created_at: Date;
}

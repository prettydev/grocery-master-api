import { Document } from "mongoose";
import { IBadge } from "../../badges/db/badge.interface";

export interface ISocial {
  name: string;
  email: string;
  image: string;
}

export interface IBadgeDate {
  badge: IBadge;
  created_at: Date;
}

export type IChannel = "facebook" | "email" | "text" | "note";
export type ICase =
  | "win"
  | "outbid"
  | "opened"
  | "lowered"
  | "changed"
  | "shipped";

export interface IFriendUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly avatar: string;
}

export interface IFriendDate {
  friend: IFriendUser;
  created_at: Date;
}

export interface IUser extends Document {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly avatar: string;
  readonly phone: string;
  readonly plan: string;
  readonly role: string;

  readonly wins: number;
  readonly coins: number;
  readonly points: number;

  readonly friends: [IFriendDate];
  readonly badges: [IBadgeDate];

  readonly email_verified: boolean;
  readonly phone_verified: boolean;

  readonly note_channels: IChannel[];
  readonly note_cases: ICase[];

  //////////////////////////////

  readonly facebook: ISocial;
  readonly google: ISocial;
  readonly twitter: ISocial;

  //////////////////////////////

  readonly expired_at: Date;
  readonly created_at: Date;
  readonly updated_at: Date;

  // message: string;
}

export interface IFetchUser {
  arr: IUser[];
  cnt: number;
}

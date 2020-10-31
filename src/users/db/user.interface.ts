import { Document } from "mongoose";

export interface IAddress {
  id: string;
  type: string;
  name: string;
  info: string;
}

export interface IContact {
  id: string;
  type: string;
  number: string;
}

export interface ICard {
  id: string;
  type: string;
  cardType: string;
  name: string;
  lastFourDigit: string;
}

export interface ISocial {
  name: string;
  email: string;
  image: string;
}

export interface IUser extends Document {
  readonly id: string;
  readonly name: string;
  readonly image: string;

  readonly email: string;
  readonly email_verified: boolean;
  
  readonly password: string;
  
  readonly plan: string;
  readonly role: string;

  readonly coins: number;
  readonly points: number;

  readonly total_order?: number,
  readonly total_order_amount?: number,

  readonly address?: IAddress[];
  readonly card?: ICard[],
  readonly contact?: IContact[],

  readonly facebook: ISocial;
  readonly google: ISocial;
  
  readonly expired_at: Date;
  readonly created_at: Date;
  readonly updated_at: Date;
  
}

export interface IFetchUser {
  arr: IUser[];
  cnt: number;
}

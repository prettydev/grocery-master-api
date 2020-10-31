import { Document } from "mongoose";

export interface ISocial {
  name: string;
  email: string;
  image: string;
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

  readonly coins: number;
  readonly points: number;

  readonly email_verified: boolean;
  readonly phone_verified: boolean;

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

import { Document, Schema } from "mongoose";

import { IExhibit } from "../../exhibits/db/exhibit.interface";

import { IUser } from "../../users/db/user.interface";

export interface IWish extends Document {
  readonly id: string;
  readonly exhibit: IExhibit;
  readonly user: IUser;
  readonly created_at: Date;
}

export interface IFetchWish {
  readonly arr: IWish[];
  readonly cnt: number;
}

export interface IWishUser {
  readonly wish: IWish;
  readonly user?: IUser;
}

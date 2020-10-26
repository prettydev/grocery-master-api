import { Document, Schema } from "mongoose";

import { IUser } from "../../users/db/user.interface";

export interface IFriend extends Document {
  readonly id: string;
  readonly sender: IUser;
  readonly receiver: IUser;
  readonly state: number;
}

export interface IFetchFriend {
  readonly arr: IFriend[];
  readonly cnt: number;
}

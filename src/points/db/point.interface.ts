import { Document, Schema } from "mongoose";

import { IUser } from "../../users/db/user.interface";

export interface IPoint extends Document {
  readonly id: string;
  readonly user_id: string;
  readonly points: number;
  readonly comment: string;
}

export interface IFetchPoint {
  readonly arr: IPoint[];
  readonly cnt: number;
}

export interface IPointUser {
  readonly point: IPoint;
  readonly user?: IUser;
}

export interface IPointResult {
  readonly point: IPoint;
  readonly message?: string;
}

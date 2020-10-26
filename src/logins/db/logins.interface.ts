import { Document, Schema } from "mongoose";

export interface ILogin extends Document {
  readonly id: string;
  readonly user_id: string;
  readonly count: number;

  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface IFetchPoint {
  readonly arr: ILogin[];
  readonly cnt: number;
}

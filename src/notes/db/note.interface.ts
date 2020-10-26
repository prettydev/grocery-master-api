import { Document } from "mongoose";

export interface INote extends Document {
  readonly id: string;
  readonly content: string;
  readonly receivers: [string];

  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface IFetchNote {
  arr: INote[];
  cnt: number;
}

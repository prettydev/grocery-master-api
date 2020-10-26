import { Document, Schema } from "mongoose";

import { IUser } from "../../users/db/user.interface";

export interface IBadge extends Document {
  readonly id: string;
  readonly kind: string;
  readonly image: string;
  readonly title: string;
  readonly details: string;
  readonly type: string;
  readonly points: number;
  readonly rewards: string;
  readonly difficulty: string;
}

export interface IFetchBadge {
  readonly arr: IBadge[];
  readonly cnt: number;
}

export interface IBadgeUser {
  readonly badge: IBadge;
  readonly user?: IUser;
}

export interface IBadgeResult {
  readonly badge: IBadge;
  readonly message?: string;
}

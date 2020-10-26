import { Document, Schema } from "mongoose";

import { IProduct } from "../../exhibits/db/product.interface";

import { IUser } from "../../users/db/user.interface";

export interface IOrder extends Document {
  readonly id: string;
  readonly product: IProduct;
  readonly user: IUser;
  readonly amount: number;
  readonly payer: string;
  readonly pay_order_id: string;
}

export interface IFetchOrder {
  readonly arr: IOrder[];
  readonly cnt: number;
}

export interface IOrderUser {
  readonly order: IOrder;
  readonly user: IUser;
}

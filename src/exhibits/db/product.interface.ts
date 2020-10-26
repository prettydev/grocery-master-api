import { Document } from "mongoose";

export interface IFirstAvailable {
  raw: string;
  utc: string;
}

export interface IVariant {
  asin: string;
  title: string;
  link: string;
}

export interface IName {
  name: string;
}

export interface INameLink {
  name: string;
  link: string;
}

export interface ITextLink {
  text: string;
  link: string;
}

export interface ILink {
  link: string;
}

export interface ILinkVariant {
  link: string;
  variant: string;
}

export interface INameValue {
  name: string;
  value: string;
}

export interface IIsNew {
  is_new: boolean;
}

export interface IPrice {
  symbol?: string;
  value: number;
  currency?: string;
  raw?: string;
}

export interface IBuybox {
  condision: IIsNew;
  price: IPrice;
  shipping: IPrice;
}

export interface IProduct extends Document {
  title: string;
  model_number: string;
  asin: string;
  link: string;
  categories: INameLink[];
  delivery_message: string;
  description: string;
  sub_title?: ITextLink;
  has_coupon?: boolean;
  rating?: number;
  main_image: ILink;
  images: ILinkVariant[];
  feature_bullets: string[];
  attributes: INameValue[];
  buybox_winner: IBuybox;
  specifications: INameValue[];
  active: boolean;
}

//root category
export interface ICategory extends Document {
  name: string;
}

export interface IFetchProduct {
  readonly arr: IProduct[];
  readonly cnt: number;
}

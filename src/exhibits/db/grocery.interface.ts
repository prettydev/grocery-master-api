import { Document } from "mongoose";

export interface IFirstAvailable {
  raw: string;
  utc: string;
}

export interface IVariant {
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

export interface II18N {
  lang: string;
  value: string;
}

export interface ILocation {
  address: string;
  lng: number;
  lat: number;
}

export interface ICreditCard {
  card_number: string;
  expired_date: string;
  cvv: string;
}

export interface IGrocery extends Document {
  name: string;  
  domain: string;
  second_lang: string;
  mobile: string;
  owner_email: string;
  bank_account: string;
  contact_email: string;
  contact_phone: string;
  opening_hours: number;
  delivery_radius: number;
  min_order: number;
  first_offer_discount: number;
  is_collect: boolean; 
  logo: ILink;
  images: [ILinkVariant];  
  location: ILocation;
  credit_card: ICreditCard;
  description: [II18N];
  delivery_policy: [II18N];
  about_us: [II18N];
}

//root category
export interface ICategory extends Document {
  name: string;
}

export interface IFetchGrocery {
  readonly arr: IGrocery[];
  readonly cnt: number;
}

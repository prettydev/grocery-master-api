import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FirstAvailableType {
  @Field()
  raw: string;
  @Field()
  utc: string;
}

@ObjectType()
export class VariantType {
  @Field()
  title: string;
  @Field()
  link: string;
}

@ObjectType()
export class NameType {
  @Field()
  name: string;
}

@ObjectType()
export class NameLinkType {
  @Field()
  name: string;
  @Field({ nullable: true })
  link?: string;
}

@ObjectType()
export class TextLinkType {
  @Field()
  text: string;
  @Field()
  link: string;
}

@ObjectType()
export class LinkType {
  @Field()
  link: string;
}

@ObjectType()
export class LinkVariantType {
  @Field()
  link: string;
  @Field()
  variant?: string;
}

@ObjectType()
export class NameValueType {
  @Field()
  name: string;
  @Field()
  value: string;
}

@ObjectType()
export class IsNewType {
  @Field()
  is_new: boolean;
}

@ObjectType()
export class PriceType {
  @Field({ nullable: true })
  symbol?: string;
  @Field()
  value: number;
  @Field({ nullable: true })
  currency?: string;
  @Field({ nullable: true })
  raw?: string;
}

@ObjectType()
export class BuyboxType {
  @Field()
  condision: IsNewType;
  @Field((type) => PriceType)
  price: PriceType;
  @Field((type) => PriceType)
  shipping: PriceType;
}

@ObjectType()
export class I18NType {
  @Field()
  lang: string;
  @Field()
  value: string;
}

@ObjectType()
export class LocationType {
  @Field()
  address: string;
  @Field()
  lng: number;
  @Field()
  lat: number;
}

@ObjectType()
export class CreditCardType {
  @Field()
  card_number: string;
  @Field()
  expired_date: string;
  @Field()
  cvv: string;
}

@ObjectType()
export class GroceryType {
  @Field()
  name: string;  
  @Field()
  second_lang: string;
  @Field()
  mobile: string;
  @Field()
  owner_email: string;
  @Field()
  bank_account: string;
  @Field()
  contact_email: string;
  @Field()
  contact_phone: string;
  @Field()
  opening_hours: number;
  @Field()
  delivery_radius: number;
  @Field()
  min_order: number;
  @Field()
  first_offer_discount: number;
  @Field()
  is_collect: boolean;
  @Field((type)=>LinkType)
  logo: LinkType;
  @Field((type) => [LinkVariantType])
  images?: LinkVariantType[];
  @Field((type)=>LocationType)
  location: LocationType;
  @Field()
  credit_card: CreditCardType;
  @Field((type) => [I18NType])
  description: [I18NType];
  @Field((type) => [I18NType])
  delivery_policy: [I18NType];
  @Field((type) => [I18NType])
  about_us: [I18NType];  
}

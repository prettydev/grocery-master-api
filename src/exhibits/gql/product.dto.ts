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
  asin: string;
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
export class ProductType {
  @Field()
  asin: string;
  @Field()
  title: string;
  // @Field((type) => FirstAvailableType)
  // first_available: FirstAvailableType;
  @Field()
  model_number: string;
  @Field({ nullable: true })
  link?: string;
  // @Field((type) => [VariantType])
  // variants: VariantType[];
  @Field((type) => [NameLinkType])
  categories: NameLinkType[];
  @Field()
  delivery_message?: string;
  @Field({ nullable: true })
  description?: string;
  @Field((type) => TextLinkType)
  sub_title?: TextLinkType;
  @Field()
  has_coupon?: boolean;
  @Field()
  rating?: number;
  @Field()
  main_image: LinkType;
  @Field((type) => [LinkVariantType])
  images?: LinkVariantType[];
  // @Field()
  // images_count: number;
  @Field((type) => [String])
  feature_bullets: string[];
  // @Field()
  // feature_bullets_count: number;
  // @Field()
  // feature_bullets_flat: string;
  @Field((type) => [NameValueType])
  attributes: NameValueType[];
  @Field((type) => BuyboxType)
  buybox_winner: BuyboxType;
  @Field((type) => [NameValueType])
  specifications: NameValueType[];
  // @Field()
  // specifications_flat: string;
  @Field()
  active: boolean;
}

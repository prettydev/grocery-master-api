import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class FirstAvailableInput {
  @Field()
  raw: string;
  @Field()
  utc: string;
}

@InputType()
export class VariantInput {
  @Field()
  asin: string;
  @Field()
  title: string;
  @Field()
  link: string;
}

@InputType()
export class NameInput {
  @Field()
  name: string;
}

@InputType()
export class NameLinkInput {
  @Field()
  name: string;
  @Field({ nullable: true })
  link?: string;
}

@InputType()
export class TextLinkInput {
  @Field()
  text: string;
  @Field()
  link: string;
}

@InputType()
export class LinkInput {
  @Field()
  link: string;
}

@InputType()
export class LinkVariantInput {
  @Field()
  link: string;
  @Field()
  variant?: string;
}

@InputType()
export class NameValueInput {
  @Field()
  name: string;
  @Field()
  value: string;
}

@InputType()
export class IsNewInput {
  @Field()
  is_new: boolean;
}

@InputType()
export class PriceInput {
  @Field({ nullable: true })
  symbol?: string;
  @Field()
  value: number;
  @Field({ nullable: true })
  currency?: string;
  @Field({ nullable: true })
  raw?: string;
}

@InputType()
export class BuyboxInput {
  @Field()
  condision: IsNewInput;
  @Field((type) => PriceInput)
  price: PriceInput;
  @Field((type) => PriceInput)
  shipping: PriceInput;
}

@InputType()
export class ProductInput {
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
  @Field((type) => [NameLinkInput])
  categories: NameLinkInput[];
  @Field({ nullable: true })
  delivery_message?: string;
  @Field({ nullable: true })
  description?: string;
  @Field((type) => TextLinkInput)
  sub_title?: TextLinkInput;
  @Field()
  has_coupon?: boolean;
  @Field()
  rating?: number;
  @Field()
  main_image: LinkInput;
  @Field((type) => [LinkVariantInput])
  images?: LinkVariantInput[];
  // @Field()
  // images_count: number;
  @Field((type) => [String])
  feature_bullets: string[];
  // @Field()
  // feature_bullets_count: number;
  // @Field()
  // feature_bullets_flat: string;
  @Field((type) => [NameValueInput])
  attributes: NameValueInput[];
  @Field((type) => BuyboxInput)
  buybox_winner: BuyboxInput;
  @Field((type) => [NameValueInput])
  specifications: NameValueInput[];
  // @Field()
  // specifications_flat: string;
}

@InputType()
export class ProductTimerInput {
  @Field((type) => ProductInput)
  product: ProductInput;

  @Field()
  live_timer: number;
}

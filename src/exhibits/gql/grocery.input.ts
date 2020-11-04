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
export class II18N {
  @Field()
  lang: string;
  @Field()
  value: string;
}

@InputType()
export class ILocation {
  @Field()
  address: string;
  @Field()
  lng: number;
  @Field()
  lat: number;
}

@InputType()
export class ICreditCard {
  @Field()
  card_number: string;
  @Field()
  expired_date: string;
  @Field()
  cvv: string;
}

@InputType()
export class GroceryInput {
  @Field()
  name: string;
  @Field()
  domain: string;  
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
  @Field((type)=>LinkInput)
  logo: LinkInput;
  @Field((type) => [LinkVariantInput])
  images?: LinkVariantInput[];
  @Field((type)=>ILocation)
  location: ILocation;
  @Field((type)=>ICreditCard)
  credit_card: ICreditCard;
  @Field((type) => [II18N])
  description: [II18N];
  @Field((type) => [II18N])
  delivery_policy: [II18N];
  @Field((type) => [II18N])
  about_us: [II18N];
}

@InputType()
export class ProductTimerInput {
  @Field((type) => GroceryInput)
  product: GroceryInput;

  @Field()
  live_timer: number;
}

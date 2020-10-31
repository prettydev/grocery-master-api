import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class LoginType {
  @Field()
  readonly username: string;

  @Field()
  readonly message: string;
}

@ObjectType()
export class AddressType {

  @Field({ nullable: true })
  readonly id: string;

  @Field({ nullable: true })
  readonly name: string;

  @Field({ nullable: true })
  readonly type: string;

  @Field({ nullable: true })
  readonly info: string;
}

@ObjectType()
export class CardType {

  @Field({ nullable: true })
  readonly id: string;

  @Field({ nullable: true })
  readonly name: string;

  @Field({ nullable: true })
  readonly type: string;

  @Field({ nullable: true })
  readonly cardType: string;

  @Field({ nullable: true })
  readonly lastFourDigit: number;

}

@ObjectType()
export class ContactType {
  @Field({ nullable: true })
  readonly id: string;

  @Field({ nullable: true })
  readonly type: string;

  @Field({ nullable: true })
  readonly number: string;
}

@ObjectType()
export class SocialType {
  @Field({ nullable: true })
  readonly name: string;

  @Field({ nullable: true })
  readonly email: string;

  @Field({ nullable: true })
  readonly image: string;
}

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  readonly name: string;

  @Field()
  readonly email: string;

  @Field()
  @Field({ nullable: true })
  readonly password: string;

  @Field(() => String)
  @Field({ nullable: true })
  readonly plan: string;

  @Field(() => String)
  @Field({ nullable: true })
  readonly role: string;

  @Field(() => String)
  @Field({ nullable: true })
  readonly image: string;

  @Field(() => Number)
  @Field({ nullable: true })
  readonly coins: number;

  @Field(() => Number)
  @Field({ nullable: true })
  readonly points: number;

  @Field(() => Boolean)
  @Field({ nullable: true })
  readonly email_verified: boolean;

  @Field(() => Number)
  @Field({ nullable: true })
  readonly total_order?: number;

  @Field(() => Number)
  @Field({ nullable: true })
  readonly total_order_amount?: number;

  @Field((type) => [AddressType], {nullable: true})
  readonly address?: AddressType[];
  
  @Field((type)=> [CardType], { nullable: true })
  readonly card?: CardType[];

  @Field((type)=>ContactType, { nullable: true })
  readonly contact?: ContactType[];

  @Field({ nullable: true })
  readonly facebook: SocialType;

  @Field({ nullable: true })
  readonly google: SocialType;

  @Field({ nullable: true })
  @Field(() => Date)
  readonly expired_at: Date;

  @Field({ nullable: true })
  @Field(() => Date)
  readonly created_at: Date;

  @Field({ nullable: true })
  @Field(() => Date)
  readonly updated_at: Date;
}

@ObjectType()
export class UserResult {
  @Field({ nullable: true })
  readonly user: UserType;

  @Field()
  readonly message: string;
}

@ObjectType()
export class FetchUserType {
  @Field((type) => [UserType])
  arr: UserType[];

  @Field()
  cnt: number;
}

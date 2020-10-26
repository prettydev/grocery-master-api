import { ObjectType, Field, ID } from "@nestjs/graphql";
import { BadgeType } from "../../badges/gql/badge.dto";

@ObjectType()
export class BadgeDateType {
  @Field()
  readonly badge: BadgeType;

  @Field()
  readonly created_at: Date;
}

@ObjectType()
export class LoginType {
  @Field()
  readonly username: string;

  @Field()
  readonly message: string;
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
export class FriendUserType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  readonly username: string;

  @Field()
  readonly email: string;

  @Field(() => String)
  @Field({ nullable: true })
  readonly avatar: string;
}

@ObjectType()
export class FriendDateType {
  @Field()
  readonly friend: FriendUserType;

  @Field()
  readonly created_at: Date;
}

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  readonly username: string;

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
  readonly phone: string;

  @Field(() => String)
  @Field({ nullable: true })
  readonly avatar: string;

  @Field(() => Number)
  @Field({ nullable: true })
  readonly wins: number;

  @Field(() => Number)
  @Field({ nullable: true })
  readonly coins: number;

  @Field(() => Number)
  @Field({ nullable: true })
  readonly points: number;

  @Field(() => Boolean)
  @Field({ nullable: true })
  readonly email_verified: boolean;

  @Field(() => Boolean)
  @Field({ nullable: true })
  readonly phone_verified: boolean;

  @Field(() => [FriendDateType], { nullable: true })
  readonly friends: FriendDateType[];

  @Field(() => [BadgeDateType], { nullable: true })
  readonly badges: BadgeDateType[];

  @Field((type) => [String], { nullable: true })
  readonly note_channels: string[];

  @Field((type) => [String], { nullable: true })
  readonly note_cases: string[];

  @Field({ nullable: true })
  readonly facebook: SocialType;

  @Field({ nullable: true })
  readonly google: SocialType;

  @Field({ nullable: true })
  readonly twitter: SocialType;

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

import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserType } from "../../users/gql/user.dto";

@ObjectType()
export class BadgeType {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  kind: string;

  @Field()
  image: string;

  @Field()
  details: string;

  @Field({ nullable: true })
  type: string;

  @Field()
  points: number;

  @Field({ nullable: true })
  rewards: string;

  @Field({ nullable: true })
  difficulty: string;
}

@ObjectType()
export class FetchBadgeType {
  @Field((type) => [BadgeType])
  arr: BadgeType[];

  @Field()
  cnt: number;
}

@ObjectType()
export class BadgeUserType {
  @Field((type) => BadgeType)
  badge: BadgeType;

  @Field((type) => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class BadgeResultType {
  @Field((type) => BadgeType)
  badge: BadgeType;

  @Field()
  message?: string;
}

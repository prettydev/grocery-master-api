import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ExhibitType } from "../../exhibits/gql/exhibit.dto";
import { UserType } from "../../users/gql/user.dto";

@ObjectType()
export class WishType {
  @Field((type) => ID)
  id: string;

  @Field((type) => ExhibitType)
  exhibit: ExhibitType;

  @Field((type) => UserType)
  user: UserType;

  @Field()
  created_at: Date;
}

@ObjectType()
export class FetchWishType {
  @Field((type) => [WishType])
  arr: WishType[];

  @Field()
  cnt: number;
}

@ObjectType()
export class WishUserType {
  @Field((type) => WishType)
  wish: WishType;

  @Field((type) => UserType, { nullable: true })
  user?: UserType;
}

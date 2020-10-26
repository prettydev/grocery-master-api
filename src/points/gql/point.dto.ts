import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserType } from "../../users/gql/user.dto";

@ObjectType()
export class PointType {
  @Field((type) => ID)
  id: string;

  @Field()
  user_id: string;

  @Field()
  points: number;

  @Field()
  comment: string;
}

@ObjectType()
export class FetchPointType {
  @Field((type) => [PointType])
  arr: PointType[];

  @Field()
  cnt: number;
}

@ObjectType()
export class PointUserType {
  @Field((type) => PointType)
  point: PointType;

  @Field((type) => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class PointResultType {
  @Field((type) => PointType)
  point: PointType;

  @Field()
  message?: string;
}

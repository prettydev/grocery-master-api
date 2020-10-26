import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserType } from "../../users/gql/user.dto";

@ObjectType()
export class FBPostType {
  @Field((type) => ID)
  id: string;

  @Field()
  permalink_url: string;
}

@ObjectType()
export class FetchFBPostType {
  @Field((type) => [FBPostType])
  arr: FBPostType[];

  @Field()
  cnt: number;
}

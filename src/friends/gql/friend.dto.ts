import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserType } from "../../users/gql/user.dto";

@ObjectType()
export class FriendType {
  @Field((type) => ID)
  id: string;

  @Field((type) => UserType)
  sender: UserType;

  @Field((type) => UserType)
  receiver: UserType;

  @Field()
  state: number;
}

@ObjectType()
export class FetchFriendType {
  @Field((type) => [FriendType])
  arr: FriendType[];

  @Field()
  cnt: number;
}

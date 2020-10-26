import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserType } from "../../users/gql/user.dto";

@ObjectType()
export class NoteType {
  @Field((type) => ID)
  id: string;

  @Field((type) => String)
  content: string;

  @Field((type) => [String])
  receivers: [string];

  @Field((type) => Date)
  created_at: Date;
}

@ObjectType()
export class PrivateNoteType {
  @Field((type) => ID)
  id: string;

  @Field((type) => String)
  title: string;

  @Field((type) => String)
  content: string;

  @Field((type) => String)
  receiver: string;

  @Field((type) => Date)
  created_at: Date;
}

@ObjectType()
export class FetchNoteType {
  @Field((type) => [NoteType])
  arr: NoteType[];

  @Field()
  cnt: number;
}

import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, Length, MaxLength } from "class-validator";

@InputType()
export class NewFriendInput {
  @Field()
  sender: string;

  @Field()
  receiver: string;
}

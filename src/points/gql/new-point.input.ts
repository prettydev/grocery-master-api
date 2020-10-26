import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, Length, MaxLength } from "class-validator";

@InputType()
export class NewPointInput {
  @Field()
  user_id: string;

  @Field()
  points: number;

  @Field()
  comment: string;
}

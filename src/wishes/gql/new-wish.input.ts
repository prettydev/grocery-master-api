import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, Length, MaxLength } from "class-validator";

@InputType()
export class NewWishInput {
  @Field()
  user: string;

  @Field((type) => String)
  exhibit: string;
}

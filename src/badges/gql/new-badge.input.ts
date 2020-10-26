import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, Length, MaxLength } from "class-validator";

@InputType()
export class NewBadgeInput {
  @Field()
  title: string;

  @Field()
  image: string;

  @Field()
  kind: string;

  @Field()
  details: string;

  @Field()
  points: number;

  @Field()
  type: string;

  @Field()
  rewards: string;

  @Field()
  difficulty: string;
}

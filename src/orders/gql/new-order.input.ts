import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, Length, MaxLength } from "class-validator";

@InputType()
export class NewOrderInput {
  @Field()
  user: string;

  @Field((type) => String)
  product: string;

  @Field()
  amount: number;

  @Field()
  payer: string;

  @Field()
  pay_order_id: string;
}

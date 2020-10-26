/**
 * simplified product for exhibit and auctiion
 */
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SimpleProductType {
  @Field()
  asin: string;

  @Field()
  title: string;

  @Field()
  link: string;

  @Field((type) => [String])
  category: Array<string>;

  @Field()
  image: string;

  @Field()
  rating: number;

  @Field()
  price: number;
}

@ObjectType()
export class ResType {
  @Field()
  code: "success" | "error";

  @Field({nullable:true})
  message?: string;
}

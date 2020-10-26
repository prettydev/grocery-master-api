import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ProductType } from "../../exhibits/gql/product.dto";
import { UserType } from "../../users/gql/user.dto";

@ObjectType()
export class OrderType {
  @Field((type) => ID)
  id: string;

  @Field((type) => ProductType)
  product: ProductType;

  @Field((type) => UserType)
  user: UserType;

  @Field()
  amount: number;

  @Field()
  payer: string;

  @Field()
  pay_order_id: string;
}

@ObjectType()
export class FetchOrderType {
  @Field((type) => [OrderType])
  arr: OrderType[];

  @Field()
  cnt: number;
}

@ObjectType()
export class OrderUserType {
  @Field((type) => OrderType)
  order: OrderType;

  @Field((type) => UserType)
  user: UserType;
}

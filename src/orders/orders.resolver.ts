import { NotFoundException, Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { PageArgs, Filter } from "../gql_common/types/common.input";
import { OrderType, OrderUserType, FetchOrderType } from "./gql/order.dto";
import { NewOrderInput } from "./gql/new-order.input";
import { OrdersService } from "./orders.service";

// @Resolver("Orders")
@Resolver((of) => OrderType)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject("PUB_SUB") private pubSub: PubSub,
  ) {}

  //still not used
  @Query((returns) => OrderType)
  async order_details(@Args("asin") asin: string): Promise<OrderType> {
    const product = await this.ordersService.find(asin);
    if (!product) {
      throw new NotFoundException(asin);
    }
    return product;
  }

  @Mutation((returns) => OrderUserType)
  async addOrder(
    @Args("input") newOrderInput: NewOrderInput,
  ): Promise<OrderUserType> {
    const orderUser = await this.ordersService.create(newOrderInput);
    // pubSub.publish("orderAdded", { orderAdded: orderUser });
    return orderUser;
  }

  @Query((returns) => FetchOrderType)
  orders(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchOrderType> {
    return this.ordersService.findAll(pageArgs, filter);
  }
}

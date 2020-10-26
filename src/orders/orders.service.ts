import { Model } from "mongoose";
import { Injectable, HttpService, Logger } from "@nestjs/common";
import { Cron, Interval, Timeout, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { IOrder, IOrderUser, IFetchOrder } from "./db/order.interface";
import { NewOrderInput } from "./gql/new-order.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";

import { UsersService } from "../users/users.service";
import { ProductsService } from "../exhibits/products.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Order") private readonly orderModel: Model<IOrder>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  private readonly httpService: HttpService = new HttpService();
  private readonly logger = new Logger(OrdersService.name);

  async create(newOrderInput: NewOrderInput): Promise<IOrderUser> {
    const product = await this.productsService.find(newOrderInput.product);

    console.log(product, "product from asin");

    const orderModel = new this.orderModel({
      ...newOrderInput,
      product: product.id,
    });
    const newOrder = await orderModel.save();

    const updatedUser = await this.usersService.increaseCoins(
      newOrderInput.user,
      10, //temporarily for test
    );

    return { order: newOrder, user: updatedUser };
  }

  async find(asin: string): Promise<IOrder> {
    return this.orderModel.findOne({ asin }).exec();
  }

  async findOneById(id: string): Promise<IOrder> {
    return {} as any;
  }

  getFilter(filter: Filter): any {
    const filterQuery =
      filter.cat === "All"
        ? {
            "product.title": { $regex: filter.key, $options: "i" },
          }
        : {
            "product.title": { $regex: filter.key, $options: "i" },
            "product.category": filter.cat,
          };
    return filterQuery;
  }

  async findAll(pageArgs: PageArgs, filter: Filter): Promise<IFetchOrder> {
    // return this.orderModel.find().exec();

    let sort = {};
    if (filter.sort === "PHTL")
      //price high to low
      sort = { "product.price": -1 };
    if (filter.sort === "PLTH")
      //price low to high
      sort = { "product.price": 1 };
    if (filter.sort === "ENDS")
      //ending soon
      sort = { fund_percent: -1 };

    const filterQuery = {
      ...this.getFilter(filter),
      $and: [{ state: { $ne: "ready" } }, { state: { $ne: "end" } }],
    };

    const arr = await this.orderModel
      .find(
        {}, //filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort,
        },
      )
      .exec();

    // const cnt = await this.orderModel.countDocuments(filterQuery).exec();
    const cnt = await this.orderModel.countDocuments().exec();
    return { arr, cnt };
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }
}

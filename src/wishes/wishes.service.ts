import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { IWish, IFetchWish } from "./db/wish.interface";
import { NewWishInput } from "./gql/new-wish.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";

const mongodb = require("mongodb");

@Injectable()
export class WishesService {
  constructor(
    @InjectModel("Wish") private readonly wishModel: Model<IWish>,    
  ) {}

  async create(newWishInput: NewWishInput): Promise<IWish> {
    const newWishObj = {
      user: new mongodb.ObjectID(newWishInput.user),
      exhibit: new mongodb.ObjectID(newWishInput.exhibit),
    };

    let newWish = await this.wishModel.findOne(newWishObj);

    if (!newWish) {
      newWish = await this.wishModel.create(newWishObj);
    }

    return newWish;
  }

  async remove(newWishInput: NewWishInput): Promise<void> {
    const newWishObj = {
      user: new mongodb.ObjectID(newWishInput.user),
      exhibit: new mongodb.ObjectID(newWishInput.exhibit),
    };
    await this.wishModel.findOneAndRemove(newWishObj);
    return;
  }

  async find(asin: string): Promise<IWish> {
    return this.wishModel.findOne({ asin }).exec();
  }

  async findOneById(id: string): Promise<IWish> {
    return {} as any;
  }

  async findAll(
    pageArgs: PageArgs,
    filter: Filter,
    user_id: string,
  ): Promise<IFetchWish> {
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
      user: new mongodb.ObjectID(user_id),
    };

    const arr = await this.wishModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort,
        },
      )
      .exec();

    const cnt = await this.wishModel.countDocuments(filterQuery).exec();

    return { arr, cnt };
  }

  async findAllMy(user_id: string): Promise<string[]> {
    const arr = await this.wishModel
      .find({ user: new mongodb.ObjectID(user_id) }, {}, {})
      .exec();

    const res = arr.map((w, idx) => {
      if (w.exhibit) return w.exhibit.id;
    });

    return res;
  }
}

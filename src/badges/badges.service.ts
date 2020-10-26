import { Model } from "mongoose";
import { Injectable, HttpService, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { IBadge, IBadgeResult, IFetchBadge } from "./db/badge.interface";
import { NewBadgeInput } from "./gql/new-badge.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";

const mongodb = require("mongodb");

@Injectable()
export class BadgesService {
  constructor(
    @InjectModel("Badge") private readonly badgeModel: Model<IBadge>,
  ) {}

  private readonly httpService: HttpService = new HttpService();
  private readonly logger = new Logger(BadgesService.name);

  async create(newBadgeInput: NewBadgeInput): Promise<IBadgeResult> {
    const badgeModel = new this.badgeModel({
      ...newBadgeInput,
    });
    const newBadge = await badgeModel.save();

    return { badge: newBadge, message: "success" };
  }

  async update(
    badge_id: string,
    newBadgeInput: NewBadgeInput,
  ): Promise<IBadgeResult> {
    const newBadge = await this.badgeModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(badge_id) },
      {
        ...newBadgeInput,
      },
      { new: true },
    );

    return { badge: newBadge, message: "success" };
  }

  async find(id: string): Promise<IBadge> {
    return this.badgeModel.findOne({ _id: new mongodb.ObjectID(id) }).exec();
  }

  getFilter(filter: Filter): any {
    const filterQuery = {
      title: { $regex: filter.key, $options: "i" },
      details: { $regex: filter.key, $options: "i" },
    };
    if (filter.cat && filter.cat.length > 1) filter["kind"] = filter.cat;
    return filterQuery;
  }

  async badges(): Promise<IBadge[]> {
    return await this.badgeModel.find({}).exec();
  }

  async findAll(pageArgs: PageArgs, filter: Filter): Promise<IFetchBadge> {
    // return this.badgeModel.find().exec();

    let sort = {};
    if (!filter.sort) sort = { created_at: -1 };
    if (filter.sort === "points") sort = { points: 1 };

    const filterQuery = {
      ...this.getFilter(filter),
    };

    const arr = await this.badgeModel
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

    const cnt = await this.badgeModel.countDocuments(filterQuery).exec();
    return { arr, cnt };
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }
}

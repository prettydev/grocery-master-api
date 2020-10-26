import { Model } from "mongoose";
import { Injectable, HttpService, Logger } from "@nestjs/common";
import { Cron, Interval, Timeout, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { IPoint, IPointResult, IFetchPoint } from "./db/point.interface";
import { NewPointInput } from "./gql/new-point.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";

const mongodb = require("mongodb");

@Injectable()
export class PointsService {
  constructor(
    @InjectModel("Point") private readonly pointModel: Model<IPoint>,
  ) {}

  private readonly httpService: HttpService = new HttpService();
  private readonly logger = new Logger(PointsService.name);

  async create(newPointInput: NewPointInput): Promise<IPointResult> {
    const pointModel = new this.pointModel({
      ...newPointInput,
    });
    const newPoint = await pointModel.save();

    return { point: newPoint, message: "success" };
  }

  async creates(newPointInputArray: Array<NewPointInput>): Promise<boolean> {
    try {
      await this.pointModel.insertMany(newPointInputArray);
    } catch (e) {
      console.log("exception for inserting multiple points...", e.toString());
      return false;
    }

    return true;
  }

  getFilter(filter: Filter): any {
    const filterQuery = {
      title: { $regex: filter.key, $options: "i" },
      details: { $regex: filter.key, $options: "i" },
    };
    if (filter.cat && filter.cat.length > 1) filter["kind"] = filter.cat;
    return filterQuery;
  }

  async findAll(pageArgs: PageArgs, filter: Filter): Promise<IFetchPoint> {
    let sort = {};
    if (!filter.sort) sort = { created_at: -1 };
    if (filter.sort === "points") sort = { points: 1 };

    const filterQuery = {
      ...this.getFilter(filter),
    };

    const arr = await this.pointModel
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

    const cnt = await this.pointModel.countDocuments(filterQuery).exec();
    return { arr, cnt };
  }

  async getBonus(user_id: string): Promise<number> {
    if (!user_id) {
      return 0;
    }
    const bonus = await this.pointModel.aggregate([
      {
        $match: {
          user_id,
        },
      },
      {
        $group: {
          _id: "$user_id",
          bonus: { $sum: "$points" },
        },
      },
    ]);

    return bonus[0].bonus;
  }
}

import { Model } from "mongoose";
import { Injectable, HttpService, Logger } from "@nestjs/common";
import { Cron, Interval, Timeout, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { ILogin } from "./db/logins.interface";

const mongodb = require("mongodb");

@Injectable()
export class LoginsService {
  constructor(
    @InjectModel("Login") private readonly loginModel: Model<ILogin>,
  ) {}

  private readonly httpService: HttpService = new HttpService();
  private readonly logger = new Logger(LoginsService.name);

  async create(user_id: string): Promise<ILogin> {
    const login = await this.loginModel.findOneAndUpdate(
      {
        user_id,
        created_at: {
          $gte: new Date(new Date().setHours(0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      },
      {
        $inc: { count: 1 },
      },
      {
        new: true,
        upsert: true,
      },
    );

    return login;
  }
}

import { Model } from "mongoose";
import { Inject, Injectable, HttpService, Logger } from "@nestjs/common";
import { Cron, Interval, Timeout, CronExpression } from "@nestjs/schedule";
import { PubSub } from "apollo-server-express";
import { InjectModel } from "@nestjs/mongoose";
import { IFriend, IFetchFriend } from "./db/friend.interface";
import { IUser } from "../users/db/user.interface";
import { NewFriendInput } from "./gql/new-friend.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";
import { GamificationService } from "../gamification/gamification.service";

const mongodb = require("mongodb");

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel("Friend") private readonly friendModel: Model<IFriend>,
    @InjectModel("User") private readonly userModel: Model<IUser>,
    @Inject("PUB_SUB") private pubSub: PubSub,
    private gamificationService: GamificationService,
  ) {}

  private readonly httpService: HttpService = new HttpService();
  private readonly logger = new Logger(FriendsService.name);

  async create(newFriendInput: NewFriendInput): Promise<boolean> {
    const inputModel = {
      sender: new mongodb.ObjectID(newFriendInput.sender),
      receiver: new mongodb.ObjectID(newFriendInput.receiver),
    };

    const oldModel = await this.friendModel.findOne(inputModel);

    if (oldModel) {
      return true;
    }

    let newFriendRequest = null;

    const friendModel = new this.friendModel(inputModel);
    try {
      newFriendRequest = await friendModel.save();
    } catch (e) {
      console.log("friend request exception:", e.toString());
    }

    return newFriendRequest ? true : false;
  }

  async deny(id: string): Promise<boolean> {
    const updatedFriend = await this.friendModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(id),
      },
      {
        state: 1,
      },
      {
        new: true,
      },
    );

    return updatedFriend ? true : false;
  }

  async findOne(id: string): Promise<IFriend> {
    const currentFriend = await this.friendModel.findOne({
      _id: new mongodb.ObjectID(id),
    });

    return currentFriend;
  }

  async remove(id: string): Promise<boolean> {
    const remove_res = await this.friendModel.remove({
      _id: new mongodb.ObjectID(id),
    });

    console.log("remove_res:", remove_res);

    return remove_res ? true : false;
  }

  async updateFriend(user_id: string, friend_id: string): Promise<IUser> {
    await this.userModel.updateOne(
      { _id: new mongodb.ObjectID(user_id) },
      {
        $pull: {
          friends: { friend: new mongodb.ObjectID(friend_id) },
        },
      },
      { new: true },
    );
    const userUpdated = await this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      {
        $push: {
          friends: {
            $each: [
              {
                friend: new mongodb.ObjectId(friend_id),
                created_at: new Date(),
              },
            ],
            $position: 0,
          },
        },
      },
      { new: true },
    );

    if (userUpdated) {
      this.gamificationService.FriendingBadge(userUpdated.id);
    }

    return userUpdated;
  }

  getFilter(filter: Filter): any {
    const filterQuery = {
      // title: { $regex: filter.key, $options: "i" },
      // details: { $regex: filter.key, $options: "i" },
    };
    return filterQuery;
  }

  async findAll(pageArgs: PageArgs, filter: Filter): Promise<IFetchFriend> {
    let sort = {};
    if (!filter.sort) sort = { created_at: -1 };
    if (filter.sort === "points") sort = { points: 1 };

    const filterQuery = {
      ...this.getFilter(filter),
    };

    const arr = await this.friendModel
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

    const cnt = await this.friendModel.countDocuments(filterQuery).exec();
    return { arr, cnt };
  }

  async findSentRequests(
    pageArgs: PageArgs,
    filter: Filter,
    user_id: string,
  ): Promise<IFetchFriend> {
    let sort = {};
    if (!filter.sort) sort = { created_at: -1 };

    const filterQuery = {
      ...this.getFilter(filter),
      sender: new mongodb.ObjectID(user_id),
    };

    const arr = await this.friendModel
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

    const cnt = await this.friendModel.countDocuments(filterQuery).exec();
    return { arr, cnt };
  }

  async findRecvRequests(
    pageArgs: PageArgs,
    filter: Filter,
    user_id: string,
  ): Promise<IFetchFriend> {
    let sort = {};
    if (!filter.sort) sort = { created_at: -1 };

    const filterQuery = {
      ...this.getFilter(filter),
      receiver: new mongodb.ObjectID(user_id),
    };

    const arr = await this.friendModel
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

    const cnt = await this.friendModel.countDocuments(filterQuery).exec();
    return { arr, cnt };
  }
}

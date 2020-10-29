/**
 * Common user service module for
 *  1. graphql resolver
 *  2. rest api controller
 *
 */
import { Model } from "mongoose";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PubSub } from "apollo-server-express";

import { NotesService } from "../notes/notes.service";
import { OtpsService } from "../otp/otps.service";

import { IUser, IFetchUser, IChannel, ICase } from "./db/user.interface";
import { NewUserInput, LoginUserInput, Social } from "./gql/new-user.input";
import { PageArgs, Filter } from "../gql_common/types/common.input";
import { ResType } from "src/gql_common/types/common.object";

const mongodb = require("mongodb");
const bcrypt = require("bcrypt");

const POINTS_RATE = 120;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel("User") private readonly userModel: Model<IUser>,
    @Inject("PUB_SUB") private pubSub: PubSub,
    private notesService: NotesService,
    private otpsService: OtpsService,    
  ) {}

  //registration
  async create(newUserInput: NewUserInput, ref: string): Promise<IUser> {
    const hash = await bcrypt.hash(newUserInput.password, 10);
    const createdUser = new this.userModel({
      ...newUserInput,
      password: hash,
      coins: 100000,
    });

    try {
      const newUser = await createdUser.save();
      return newUser;
    } catch (e) {
      console.log("user creation exception:", e.toString());
      return null;
    }
  }

  //login
  async login(loginUserInput: LoginUserInput): Promise<IUser> {
    return this.userModel.findOne(loginUserInput);
  }

  async increaseCoins(id: string, amount: number): Promise<IUser> {
    let coins = 0;

    //5%
    if (amount === 20) coins = 21;
    //10%
    else if (amount === 50) coins = 55;
    //12%
    else if (amount === 100) coins = 112;
    //15%
    else if (amount === 200) coins = 230;
    //20%
    else if (amount === 500) coins = 600;

    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(id) },
      { $inc: { coins } },
      { new: true },
    );
  }

  async increaseWins(id: string, wins = 1): Promise<IUser> {
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(id) },
      { $inc: { wins } },
      { new: true },
    );
  }

  async decreaseCoins(id: string, amount: number): Promise<IUser> {
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(id) },
      { $inc: { coins: -1 * amount } },
      { new: true },
    );
  }

  async addPoints(id: string, amount: number): Promise<IUser> {
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(id) },
      { $inc: { points: amount } },
      { new: true },
    );
  }

  async updateWins(id: string, amount: number): Promise<IUser> {
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(id) },
      { $inc: { wins: amount } },
      { new: true },
    );
  }

  async findOne(email: string): Promise<IUser> {
    return this.userModel.findOne({ email });
  }

  async findOneById(id: string): Promise<IUser> {
    return this.userModel.findOne({ _id: new mongodb.ObjectID(id) });
  }

  async findAll(pageArgs: PageArgs, filter: Filter): Promise<IUser[]> {
    return this.userModel.find().exec();
  }

  getFilter(filter: Filter): any {
    // const filter =
    //   pageArgs.cat === "All"
    //     ? {
    //         "product.title": { $regex: pageArgs.key, $options: "i" },
    //       }
    //     : {
    //         "product.title": { $regex: pageArgs.key, $options: "i" },
    //         "product.category": pageArgs.cat,
    //       };
    return {}; //filter;
  }

  async findLeaders(pageArgs: PageArgs, filter: Filter): Promise<IFetchUser> {
    let sort = {};
    if (!filter.sort) sort = { points: -1 };

    const arr = await this.userModel
      .find(
        this.getFilter(filter),
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort,
        },
      )
      .exec();

    const cnt = await this.userModel
      .countDocuments(this.getFilter(filter))
      .exec();
    return { arr, cnt };
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }

  async changeAvatar(user_id: string, avatar: string): Promise<IUser> {
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      { avatar },
      { new: true },
    );
  }

  async addSocial(user_id: string, social: Social): Promise<IUser> {
    const userUpdated: IUser = await this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      { [social.key]: social.value },
      { new: true },
    );    
    return userUpdated;
  }

  async socialRegisterLogin(social: Social): Promise<IUser> {
    let keyname = "facebook.email";
    if (social.key === "google") keyname = "google.email";
    const current_user = await this.userModel.findOne({
      [keyname]: social.value.email,
    });
    if (current_user) {
      console.log("social ok with current user ");
      return current_user;
    } else {
      const createdUser = new this.userModel({
        email: social.value.email,
        username: social.value.name,
        avatar: social.value.image,
        coins: 100000,
        [social.key]: social.value,
      });
      console.log("social ok with new user...");
      const userUpdated = await createdUser.save();
      return userUpdated;
    }
  }

  async changePassword(user_id: string, password: string): Promise<IUser> {
    const hash = await bcrypt.hash(password, 10);
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      { password: hash },
      { new: true },
    );
  }

  async changeNoteChannels(
    user_id: string,
    note_channels: IChannel[],
  ): Promise<IUser> {
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      { note_channels },
      { new: true },
    );
  }

  async changeNoteCases(user_id: string, note_cases: ICase[]): Promise<IUser> {
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      { note_cases },
      { new: true },
    );
  }

  async exchange(user_id: string, coins: number): Promise<IUser> {
    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      {
        $inc: { coins, points: -coins * POINTS_RATE },
      },
      { new: true },
    );
  }

  async updatePlan(
    plan_name: string,
    user_id: string,    
  ): Promise<IUser> {
    const expired_at = new Date();
    expired_at.setMonth(expired_at.getMonth() + 1);

    const updateQuery = { $inc: { coins: -99 }, plan:plan_name, expired_at };
    
    console.log(updateQuery, ":updateQuery");

    return this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      updateQuery,
      { new: true },
    );
  }

  async validateUser(user_id: string, password: string): Promise<IUser> {
    const user = await this.userModel.findById(new mongodb.ObjectID(user_id));
    if (!user) return null;
    const message = await bcrypt.compare(password, user.password);
    if (!message) return null;
    return user;
  }

  async authProc(token: string): Promise<boolean> {
    console.log("token from the request is ", token);
    const tokenObj = this.notesService.tokens.filter(
      (t) => t.token === token,
    )[0];
    if (!tokenObj) {
      return false;
    }
    const oldUser = await this.userModel.findOne({ email: tokenObj.email });
    if (oldUser) {
      this.logger.error("The email already used by ", oldUser.id);
      return false;
    }
    const userUpdated = await this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(tokenObj.user_id) },
      { email: tokenObj.email, email_verified: true },
      { new: true },
    );
    this.pubSub.publish("userUpdated", {
      userUpdated,
    });    
    return true;
  }

  async smsProc(token: string): Promise<ResType> {
    console.log("token from the sms auth is ", token);
    const tokenObj = this.otpsService.tokens.filter(
      (t) => t.token === parseInt(token),
    )[0];
    if (!tokenObj) {
      return {code:"error", message:"Invalid code!"};
    }
    const oldUser = await this.userModel.findOne({ phone: tokenObj.phone });
    if (oldUser) {
      this.logger.error("The phone number already used by ", oldUser.id);
      return {code:"error", message:`The phone number ${tokenObj.phone} already used by others.`};
    }
    const userUpdated = await this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(tokenObj.user_id) },
      { phone: tokenObj.phone, phone_verified: true },
      { new: true },
    );
    this.pubSub.publish("userUpdated", {
      userUpdated,
    });    
    return {code:"success"};
  }
}

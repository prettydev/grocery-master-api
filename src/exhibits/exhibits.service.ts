import { Model } from "mongoose";
import { HttpService, Injectable, Inject, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PubSub } from "apollo-server-express";

import { UsersService } from "../users/users.service";
import { NotesService } from "../notes/notes.service";

import {
  IAuction,
  IMessage,
} from "./db/exhibit.interface";
import { IUser } from "../users/db/user.interface";
import {
  MessageInput,
} from "./gql/fund-exhibit.input";

import { PageArgs, Filter } from "../gql_common/types/common.input";
import { ILogin } from "src/logins/db/logins.interface";
import { ResType } from "src/gql_common/types/common.object";

const mongodb = require("mongodb");

@Injectable()
export class ExhibitsService {
  public live_auctions: IAuction[];
  public psuedo_auto_users: IUser[];

  private readonly logger = new Logger(ExhibitsService.name);

  constructor(
    @InjectModel("User") private readonly userModel: Model<IUser>,
    @InjectModel("Message") private readonly messageModel: Model<IMessage>,
    @InjectModel("Login") private readonly loginModel: Model<ILogin>,
    @Inject("PUB_SUB") private pubSub: PubSub,
    private usersService: UsersService,
    private notesService: NotesService,
    private httpService: HttpService,    
  ) {
   
  }

  sendWinnerNote(auction: IAuction): void {
    const content = `You winned the auction. Please check here. ${process.env.SITE_URL}auctions/${auction.id}`; // need to fix "completed when uncomment above comments"
    try {
      this.pubSub.publish("privateNoteUpdated", {
        privateNoteUpdated: {
          title: "winner",
          content,
          receiver: auction.bidders[0].user.id,
        },
      });
    } catch (e) {
      console.log("exception private notedata....", e);
    }
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

  getSort(filter: Filter): any {
    let sortQuery = {};
    if (filter.sort === "latest") sortQuery = { created_at: -1 };
    else if (filter.sort === "oldest") sortQuery = { created_at: 1 };
    else if (filter.sort === "highest") sortQuery = { "product.price": -1 };
    else if (filter.sort === "lowest") sortQuery = { "product.price": 1 };
    else if (filter.sort === "most") sortQuery = { fund_percent: -1 };
    else if (filter.sort === "fewest") sortQuery = { fund_percent: 1 };
    else if (filter.sort === "soon") sortQuery = { timer: 1 };
    else if (filter.sort === "manual") sortQuery = { manual: 1 };

    return sortQuery;
  }

  async addToChatters(newMessage: IMessage): Promise<void> {
    const chat_auction = this.live_auctions.filter(
      (la) => la.id === newMessage.room_id,
    )[0];
    if (chat_auction && !chat_auction.chatters.includes(newMessage.user_id)) {
      chat_auction.chatters.push(newMessage.user_id);
      this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: chat_auction, timestamp: new Date().getTime() } });
    }
  }

  async createMessage(newMessageInput: MessageInput): Promise<boolean> {
    const messageModel = new this.messageModel(newMessageInput);
    const newMessage = await messageModel.save();

    this.addToChatters(newMessage);

    return newMessage ? true : false;
  }

  async findMessages(): Promise<IMessage[]> {
    const messages = await this.messageModel.find({}).exec();
    return messages;
  }

  }

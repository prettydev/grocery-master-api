import { Model } from "mongoose";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, Interval, Timeout, CronExpression } from "@nestjs/schedule";
import { PubSub } from "apollo-server-express";
import { InjectModel } from "@nestjs/mongoose";
import { IUser } from "../users/db/user.interface";
import { INote, IFetchNote } from "../notes/db/note.interface";

import { NoteType } from "../exhibits/gql/exhibit.dto";

import * as dotenv from "dotenv";
import { PageArgs, Filter } from "src/gql_common/types/common.input";
dotenv.config();

const mongodb = require("mongodb");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface IToken {
  user_id: string;
  email: string;
  token: string;
  time: Date;
}

@Injectable()
export class NotesService {
  public tokens: Array<IToken> = [];

  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectModel("User") private readonly userModel: Model<IUser>,
    @InjectModel("Note") private readonly noteModel: Model<INote>,
    @Inject("PUB_SUB") private pubSub: PubSub,
  ) {}

  async new_auction_notify(auction_id: string): Promise<boolean> {
    const content = `New auction started. Please check here. ${process.env.SITE_URL}auctions/${auction_id}`;
    const html = `<h2>${content}</h2>`;

    //////////////// select emails list from the users who have checked email filed of the note_channels/////////////////////
    const email_receivers: string[] = [];
    const email_users = await this.userModel.find({
      note_channels: "email",
      email_verified: true,
    }).exec();
    email_users.map((eu, idx) => email_receivers.push(eu.email));
    if (!email_receivers.length || !content) {
      console.log("wrong email receivers:", email_receivers, content);
      return false;
    }
    const email_res = await this.sendEmail(email_receivers, html);

    ///////////// select note users  ////////////////////////////
    const note_receivers: string[] = [];
    const note_users = await this.userModel.find({
      note_channels: "note",
    }).exec();

    note_users.map((nu, idx) => note_receivers.push(nu.id));
    if (!note_receivers.length || !content) {
      console.log("wrong note receivers:", note_receivers, content);
      return false;
    }

    this.pubSub.publish("noteUpdated", {
      noteUpdated: {
        content: content,
        receivers: note_receivers,
      },
    });

    return email_res;
  }

  public token_live_time = 1000 * 60 * 5; //5min

  @Interval(1000 * 60)
  async filterTokens(): Promise<void> {
    this.tokens = this.tokens.filter(
      (t) => new Date().getTime() - t.time.getTime() < this.token_live_time,
    );

    return;
  }

  async authMail(user_id: string, email: string): Promise<boolean> {
    if (!email || !user_id) {
      console.log("wrong email", user_id, email);
      return false;
    }

    let token = "";

    for (token = ""; token.length < 40; )
      token += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"[
        (Math.random() * 60) | 0
      ];

    console.log(token);

    const currentToken = {
      user_id,
      email,
      token,
      time: new Date(),
    };

    this.tokens.push(currentToken);

    const url = `${process.env.API_URL}users/mailAuth?token=${token}`;
    const html = `<div><p>Please verify your email by clicking this <a href='${url}'>link</a></p></div>`;

    const res = await this.sendEmail([email], html);

    return res;
  }

  async sendEmail(to: string[], html: string): Promise<boolean> {
    try {
      const msg = {
        to,
        from: "creditcoder@hotmail.com",
        subject: "Exhibia Notification",
        text: "This is from the Exhibia.",
        html,
      };
      await sgMail.send(msg);
      this.logger.verbose(`Email was sent to the ${to}`);
      return true;
    } catch (e) {
      console.log("exception while sending auth email", e.toString());
      return false;
    }
  }
  ///////////////////////////for notes///////////////////////////////////

  getFilter(filter: Filter): any {
    const filterQuery = {
      // title: { $regex: filter.key, $options: "i" },
      // details: { $regex: filter.key, $options: "i" },
    };
    return filterQuery;
  }

  async removeNote(note_id: string): Promise<boolean> {
    await this.noteModel.remove({ _id: new mongodb.ObjectID(note_id) });
    return true;
  }

  async notes(
    pageArgs: PageArgs,
    filter: Filter,
    user_id: string,
  ): Promise<IFetchNote> {
    let sort = {};
    if (!filter.sort) sort = { created_at: -1 };

    const filterQuery = {
      ...this.getFilter(filter),
      receivers: new mongodb.ObjectID(user_id),
    };

    const arr = await this.noteModel
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

    const cnt = await this.noteModel.countDocuments(filterQuery).exec();
    return { arr, cnt };
  }
}

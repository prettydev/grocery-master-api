import { Model } from "mongoose";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, Interval, Timeout, CronExpression } from "@nestjs/schedule";
import { PubSub } from "apollo-server-express";
import { InjectModel } from "@nestjs/mongoose";

import * as dotenv from "dotenv";
import { PageArgs, Filter } from "src/gql_common/types/common.input";
import { FBPostType, FetchFBPostType } from "./gql/facebook.dto";
dotenv.config();

const mongodb = require("mongodb");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { Facebook, FacebookApiException } = require("fb");
const options = {
  appId: process.env.FACEBOOK_ID,
  autoLogAppEvents: true,
  xfbml: true,
  version: "v8.0",
};
const fb = new Facebook(options);
fb.setAccessToken(
  "EAAEYSkpRCywBAGLrtCIrRad8l9o3HLZCXraZC0a3TBNg6DmAqEVEb8aDsgsBWjtWkjrzFffzp1z46a3jd9Nqa7BuOCziAEvGWqCy2alk3aUF1nMSerprmPAR3q7luYoSBApydrYBrpo1MZAkSCun23YVZBm8h4iqhW7kPsVHTwZDZD",
);

@Injectable()
export class FacebookService {
  constructor(@Inject("PUB_SUB") private pubSub: PubSub) {}
  getFilter(filter: Filter): any {
    const filterQuery = {
      // title: { $regex: filter.key, $options: "i" },
      // details: { $regex: filter.key, $options: "i" },
    };
    return filterQuery;
  }

  async getPosts(pageArgs: PageArgs, filter: Filter): Promise<FetchFBPostType> {
    let sort = {};
    // if (!filter.sort) sort = { created_at: -1 };
    // const filterQuery = this.getFilter(filter);

    // const res = await fb.api("/117959396666911/posts");
    const res = await fb.api("/117959396666911/feed?fields=permalink_url");

    const arr: Array<FBPostType> = res.data;
    const cnt = arr.length;
    return { arr, cnt };
  }
}

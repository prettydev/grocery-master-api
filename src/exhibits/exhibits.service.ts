import { Model } from "mongoose";
import { HttpService, Injectable, Inject, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Interval } from "@nestjs/schedule";
import { PubSub } from "apollo-server-express";

import { UsersService } from "../users/users.service";
import { NotesService } from "../notes/notes.service";

import {
  TState,
  IExhibit,
  IHistory,
  IFetchExhibit,
  IExhibitUser,
  IAuction,
  IFetchAuction,
  IAuctionUser,
  IFetchHistory,
  IMessage,
} from "./db/exhibit.interface";
import { IUser } from "../users/db/user.interface";
import {
  FundExhibitInput,
  BidAuctionInput,
  AutoAuctionInput,
  MessageInput,
} from "./gql/fund-exhibit.input";

import {
  ExhibitType,
  AuctionType,
  HistoryType,
  CurrentStatisticsType,
  HistoryStatisticsType,
} from "./gql/exhibit.dto";
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
    @InjectModel("Exhibit") private readonly exhibitModel: Model<IExhibit>,
    @InjectModel("Auction") private readonly auctionModel: Model<IAuction>,
    @InjectModel("History") private readonly historyModel: Model<IHistory>,
    @InjectModel("User") private readonly userModel: Model<IUser>,
    @InjectModel("Message") private readonly messageModel: Model<IMessage>,
    @InjectModel("Login") private readonly loginModel: Model<ILogin>,
    @Inject("PUB_SUB") private pubSub: PubSub,
    private usersService: UsersService,
    private notesService: NotesService,
    private httpService: HttpService,    
  ) {
    this.initMemoryVariables();
  }

   async initMemoryVariables(): Promise<void> {
    const live_auctions_temp = await this.auctionModel
      .find(
        { $and: [{ state: { $ne: "ready" } }, { state: { $ne: "end" } }] },
        {},
        {
          sort: {manual: 1},
        },
      )
      .exec();
    this.live_auctions = live_auctions_temp.map((lut: IAuction) => {
      lut.live_timer = lut.timer || 600; //default test time
      lut.bid_speed = 0;
      return lut;
    });

    ///////////////////////////// for infinit test /////////////////////////////
    this.psuedo_auto_users = await this.userModel.find().exec();
    ////////////////////////////////////////////////////////////////////////////
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

  /**
   * auto bid every 10s(currently every 10s, all the auto bidders bids,
   * maybe little more complex multi timers needed
   */
  @Interval(10000)
  async updateAutoBidState(): Promise<any> {
    if (!this.live_auctions) {
      this.logger.error("no live auctions now, wait please...");
      return;
    }

    const offset = 5;
    this.live_auctions.map((la) => {
      if (la.state !== "ready" && la.state !== "end" && la.autos.length > 0)
        la.autos.map((auto) => {
          if (
            !la.bidders[0] ||
            (auto.user.id !== la.bidders[0].user.id &&
              la.bidders[0].value < auto.value &&
              auto.active)
          ) {
            let value = offset;

            if (la.bidders[0])
              value = Math.min(la.bidders[0].value + offset, auto.value);

            this.bid(
              {
                auction_id: la.id,
                user: auto.user.id,
                value,
              },
              true,
            );
          }
        });
    });
  }

  // @Interval(10000) //pseudo auto bid every 10s, for infinite test
  async updatePseudoAutoBidState(): Promise<any> {
    const offset = 1;
    this.live_auctions.map((la) => {
      if (la.state !== "ready" && la.state !== "end") {
        const auto_user_idx = Math.floor(
          Math.random() * this.psuedo_auto_users.length,
        );
        const auto = this.psuedo_auto_users[auto_user_idx];
        if (!auto) return;

        if (!la.bidders[0] || auto.id !== la.bidders[0].user.id) {
          let value = offset;
          if (la.bidders[0]) value = la.bidders[0].value + offset;

          this.bid(
            {
              auction_id: la.id,
              user: auto.id,
              value,
            },
            true,
          );
        }
      }
    });
  }

  async bid(
    bidAuctionInput: BidAuctionInput,
    auto = false,
  ): Promise<IAuctionUser> {
    const ca = await this.auctionModel.findById(bidAuctionInput.auction_id);

    if (!ca) {
      return { auction: null, user: null };
    }

    if (ca.bidders.length > 0 && bidAuctionInput.value <= ca.bidders[0].value) {
      return { auction: ca, user: null };
    }

    try {
      const pullQuery1 = {
        $pull: {
          bidders: { user: new mongodb.ObjectID(bidAuctionInput.user) },
        },
      };

      const pullQuery2 = {
        $pull: {
          bidders: { user: new mongodb.ObjectID(bidAuctionInput.user) },
        },
        bid_started_at: new Date(),
      };

      await this.auctionModel.updateOne(
        { _id: new mongodb.ObjectID(bidAuctionInput.auction_id) },
        !!ca.bidders.length ? pullQuery1 : pullQuery2,
        { multi: true },
      );
    } catch (e) {
      console.log("bidder remove exception ", e.toString());
    }

    const auctionUpdated = await this.auctionModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(bidAuctionInput.auction_id),
      },
      {
        $push: {
          bidders: {
            $each: [
              {
                user: new mongodb.ObjectID(bidAuctionInput.user),
                value: bidAuctionInput.value,
              },
            ],
            $position: 0, //insert to the first position
          },
        },
      },
      {
        new: true,
      },
    );

    const userUpdated = await this.usersService.decreaseCoins(
      bidAuctionInput.user,
      1, //bidAuctionInput.value, for infinite bid
    );

    if (auctionUpdated) {
      this.live_auctions.map((la, idx) => {
        if (la.id === auctionUpdated.id) {
          console.log(la.id, auctionUpdated.id);

          this.live_auctions[idx].live_timer = this.live_auctions[idx].timer; //reset timer after bid
          auctionUpdated.live_timer = this.live_auctions[idx].live_timer;
          auctionUpdated.chatters = this.live_auctions[idx].chatters;
          this.live_auctions[idx] = auctionUpdated;

          auctionUpdated.bid_speed = this.calcBidSpeed(auctionUpdated);

          this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: auctionUpdated, timestamp: new Date().getTime() }});
        }
      });
    }

    if (userUpdated) {
      // userUpdated.message = `User ${userUpdated.email} has placed a bid!`;
      this.pubSub.publish("userUpdated", {
        userUpdated,
      });
    }

    ///////////////////fbpost////////////////////////////////
    // if (!auto && auctionUpdated.campaign) {
    if (!auto) {
      try {
        const params = {
          title: auctionUpdated.product.title,
          image: auctionUpdated.product.image,
          bidder: userUpdated.username,
        };

        await this.httpService
          .get("https://hook.integromat.com/nntg6h9rjqeg1pmua517sd9almavs6og", {
            params,
          })
          .toPromise();
      } catch (e) {
        console.log(e.toString(), "Exception while facebook posting ...");
      }
    } else {
      console.log(
        "Canceld the facebook posting ...",
        auto,
        auctionUpdated.campaign,
      );
    }

    /////////////////////////////////////////////////////////

    return { auction: auctionUpdated, user: userUpdated };
  }

  calcBidSpeed(auc: IAuction): number {
    const bid_time = new Date().getTime() - auc.bid_started_at.getTime();

    return (auc.bidders.length / bid_time) * 1000;
  }

  async auto(autoAuctionInput: AutoAuctionInput): Promise<IAuction> {
    try {
      await this.auctionModel.updateOne(
        { _id: new mongodb.ObjectID(autoAuctionInput.auction_id) },
        {
          $pull: {
            autos: { user: new mongodb.ObjectID(autoAuctionInput.user) },
          },
        },
        { multi: true },
      );
    } catch (e) {
      console.log("autos remove exception ", e);
    }

    const auctionUpdated = await this.auctionModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(autoAuctionInput.auction_id),
      },
      {
        $push: {
          autos: {
            $each: [
              {
                user: new mongodb.ObjectID(autoAuctionInput.user),
                value: autoAuctionInput.value,
                active: autoAuctionInput.active,
              },
            ],
            $position: 0,
          },
        },
      },
      {
        new: true,
      },
    );

    if (auctionUpdated) {
      this.live_auctions.map((lu, idx) => {
        if (lu.id === auctionUpdated.id) {
          auctionUpdated.live_timer = this.live_auctions[idx].live_timer;
          this.live_auctions[idx] = auctionUpdated;
          this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: auctionUpdated, timestamp: new Date().getTime() } });
        }
      });
    }

    if (autoAuctionInput.active) {
      await this.userModel.findOne({
        _id: new mongodb.ObjectID(autoAuctionInput.user),
      });      
    }

    return auctionUpdated;
  }

  async updateLiveState(auction_id: string, state: TState): Promise<IAuction> {
    const updatedAuction = await this.auctionModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(auction_id),
      },
      {
        state,
      },
      {
        new: true,
      },
    );

    this.logger.log(updatedAuction);

    return updatedAuction;
  }

  async setThreshold(exhibit_id: string, threshold: number): Promise<IExhibit> {
    const updatedExhibit = this.exhibitModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(exhibit_id),
      },
      {
        threshold,
      },
      {
        new: true,
      },
    );

    return updatedExhibit;
  }

  async findExhibitById(id: string): Promise<IExhibit> {
    const exhibit = await this.exhibitModel.findOne({
      _id: new mongodb.ObjectID(id),
    });

    return exhibit;
  }

  async findAuctionById(id: string): Promise<IAuction> {
    const auction = await this.auctionModel.findOne({
      _id: new mongodb.ObjectID(id),
    });

    return auction;
  }

  async addToWatchers(auction_id: string, user_id: string): Promise<void> {
    const watch_auction = this.live_auctions.filter(
      (la) => la.id === auction_id,
    )[0];
    if (watch_auction && !watch_auction.watchers.includes(user_id)) {
      watch_auction.watchers.push(user_id);
      this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: watch_auction, timestamp: new Date().getTime() } });
    }
  }

  async findLiveAuctionByIdAndWatch(
    auction_id: string,
    user_id: string,
  ): Promise<IAuction> {
    this.addToWatchers(auction_id, user_id);
    return this.findLiveAuctionById(auction_id);
  }

  async findLiveAuctionById(id: string): Promise<IAuction> {
    const live_auction_arr = this.live_auctions
      ? this.live_auctions.filter((la) => la.id === id)
      : null;

    if (live_auction_arr[0]) {
      live_auction_arr[0].bid_speed = this.calcBidSpeed(live_auction_arr[0]);
      return live_auction_arr[0];
    }
    return null;
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

  async findExhibitsAll(
    pageArgs: PageArgs,
    filter: Filter,
  ): Promise<IFetchExhibit> {
    const filterQuery = this.getFilter(filter);
    const sortQuery = this.getSort(filter);

    const arr = await this.exhibitModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort: sortQuery,
        },
      )
      .exec();

    const cnt = await this.exhibitModel.countDocuments(filterQuery).exec();
    return { arr, cnt };
  }

  async findTop(): Promise<IExhibit[]> {
    return this.exhibitModel
      .find(
        {},
        {},
        {
          limit: 12,
          sort: { fund_percent: -1 },
        },
      )
      .exec();
  }

  // @Timeout(1000)
  // async startCreateTestAuctions(): Promise<void> {
  //   this.createTestAuctionFromExhibit(0);
  // }
  /**
   * Create test auctions from exhibia without funding, but set fund_amount, percent and etc.
   * @param data
   */
  async createTestAuctionFromExhibit(limit: number): Promise<void> {
    const exhibit_arr: ExhibitType[] = await this.exhibitModel
      .find({}, {}, {limit})
      .exec();

    if (exhibit_arr.length === 0) return;

    exhibit_arr.map(async (exbt: ExhibitType, idx) => {
      const auction = new AuctionType();
      auction.id = exbt.id;
      auction.product = exbt.product;
      auction.funders = exbt.funders;
      auction.fund_amount = Math.ceil(exbt.product.price) + exbt.fund_amount;
      auction.fund_percent = 100 + exbt.fund_percent;
      auction.threshold = exbt.threshold;
      ///////////////////////////////////////////
      auction.autos = [];
      auction.bidders = [];
      auction.watchers = [];
      auction.chatters = [];
      auction.state = "cool";
      auction.timer = 3600; //default timer

      const auctionModel = new this.auctionModel(auction);
      auctionModel._id = auction.id; //use the same _id with exhibit, so just move to auction collection with some more fields
      const new_auction = await auctionModel.save();

      if (new_auction === auctionModel) {
        // remove exhibit from the collection
        this.removeExhibit(auction.id);
      } else {
        console.log("failed to create new auction...", auction);
      }
      this.logger.log(
        limit + "=====>" + (idx + 1) + "...........th auction created",
      );
    });
  }

  async removeExhibit(id: string): Promise<boolean> {
    await this.exhibitModel.deleteOne({
      _id: new mongodb.ObjectID(id),
    });
    return true;
  }

  //////////////////////----------------for auctions--------------------/////////////////////////////

  /**
   *     input : Ended Auction
   *     add fields
   *     - winner : user
   *     - end_bids: number
   */

  async auctions(
    pageArgs: PageArgs,
    filter: Filter,
  ): Promise<IFetchAuction> {
    const filterQuery = {
      ...this.getFilter(filter),
      $and: [{ state: { $ne: "ready" } }, { state: { $ne: "end" } }],
    };

    const sortQuery = this.getSort(filter);

    const ads_auctions = await this.auctionModel.find({ $or: [{ manual: 1 }, {manual:2}] });
    
    const auctions_from_db = await this.auctionModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort: sortQuery,
        },
      )
      .exec();

    const id_arr = auctions_from_db.map((afd) => afd.id); //id array
    let id_arr2 = [...id_arr]

    console.log("id_arr:", id_arr);
 
    if (ads_auctions.length>0) {
      ads_auctions.map((a, i) => {
        
        if (!id_arr2.includes(a.id)) { // to avoid duplicated insert, in the case of first page
          id_arr2.splice(i, 0, a.id)// if second param is 1:replace, 0: insert, here i used 0 to insert
        }
               
      });
    } 

    if (id_arr2.length > pageArgs.take) {
      id_arr2 = id_arr2.slice(0, pageArgs.take);// if over the length due to inserting ads, then cut last elements
    }

    if (!this.live_auctions) {
      this.live_auctions = [];
    }

    const arr = this.live_auctions.filter((la) => id_arr2.includes(la.id));        
    const cnt = await this.auctionModel.countDocuments(filterQuery).exec();

    return { arr, cnt, timestamp: new Date().getTime() };
  }

  async findLastAuction(
    pageArgs: PageArgs,
    filter: Filter,
  ): Promise<IAuction> {
    const filterQuery = {
      ...this.getFilter(filter),
      $and: [{ state: { $ne: "ready" } }, { state: { $ne: "end" } }],
    };

    const sortQuery = this.getSort(filter);

    const auctions_from_db = await this.auctionModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort: sortQuery,
        },
      )
      .exec();

    const last_id = auctions_from_db.map((afd) => afd.id)[auctions_from_db.length-1]; //id array

    //filter live_auctions based on the id_arr and return them.
    if (!this.live_auctions) this.live_auctions = [];
    const last_auction = this.live_auctions.filter((la) => last_id === la.id)[0];
    // .sort((a, b) => b.timer - a.timer);

    return last_auction;
  }

  async findAdminAuctionsAll(
    pageArgs: PageArgs,
    filter: Filter,
  ): Promise<IFetchAuction> {
    const filterQuery = this.getFilter(filter);
    const sortQuery = this.getSort(filter);

    const arr = await this.auctionModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort: sortQuery,
        },
      )
      .exec();

    const cnt = await this.auctionModel
      .countDocuments(this.getFilter(filter))
      .exec();
    return { arr, cnt, timestamp: new Date().getTime() };
  }

  async findAdminCompletedAuctionsAll(
    pageArgs: PageArgs,
    filter: Filter,
  ): Promise<IFetchHistory> {
    const filterQuery = this.getFilter(filter);
    const sortQuery = this.getSort(filter);

    const arr = await this.historyModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort: sortQuery,
        },
      )
      .exec();

    const cnt = await this.historyModel
      .countDocuments(this.getFilter(filter))
      .exec();
    return { arr, cnt };
  }

  async setCampaign(auction_id: string, campaign: boolean): Promise<IAuction> {
    const updatedAuction = await this.auctionModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(auction_id),
      },
      {
        campaign,
      },
      {
        new: true,
      },
    );

    return updatedAuction;
  }

  /**
   * called when the manager switches the 'bid reserved'
   * @param auction_id
   * @param reserved
   */
  async setReserved(auction_id: string, reserved: boolean): Promise<IAuction> {
    const updatedAuction = await this.auctionModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(auction_id),
      },
      {
        reserved,
      },
      {
        new: true,
      },
    );

    const liveUpdatedAuction = this.live_auctions.filter(
      (la) => la.id === updatedAuction.id,
    )[0];

    if (!liveUpdatedAuction) {
      this.logger.log("no live auction for the set reserved result...");
      return null;
    }

    liveUpdatedAuction.reserved = reserved;

    this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: liveUpdatedAuction, timestamp: new Date().getTime() }});

    return liveUpdatedAuction;
  }

  async setExhibitManual(manual: number, exhibit_id: string): Promise<IExhibit> {

    const current_exhibits_arr = await this.exhibitModel.find({ manual }).exec();
    
    current_exhibits_arr.map((e, i) => {
      e.manual = 65535
      this.pubSub.publish("exhibitUpdated", {
        exhibitUpdated: e
      });
    });
    
    await this.exhibitModel.updateMany(
      {        
        manual
      },
      {
        manual: 65535,
      },
      {        
      },
    );

    const exhibitUpdated = await this.exhibitModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(exhibit_id),
      },
      {
        manual,
      },
      {
        new: true,
      },
    );

    this.pubSub.publish("exhibitUpdated", {
      exhibitUpdated,
    });

    return exhibitUpdated;
  }

  async setAuctionManual(req_manual: number, auction_id: string): Promise<IAuction> {
 
    let new_manual = req_manual;
    let max_manual = 65535;
    let old_manual = 65535;

    const manual_items = await this.auctionModel.find({ manual: { $lt: 65535 } }, {}, { sort: { manual: -1 } }).exec();
    if (manual_items[0]) {
      max_manual = manual_items[0].manual;
    } else {
      new_manual = 1;
    }
    const old_item = manual_items.filter((item, i) => (item.id === auction_id));
    if (old_item[0]) {
      old_manual = old_item[0].manual;
    }
    
    let filterQuery = null;
    let updateQuery = null;

    console.log("max, old, req:", max_manual, old_manual, req_manual);

    if (max_manual < old_manual && max_manual < req_manual) {
      new_manual = max_manual + 1;
      console.log("manual update: first case")
    } else if (old_manual < req_manual && req_manual <= max_manual) {
      filterQuery = { $and: [{ manual: { $gt: old_manual } }, { manual: { $lte: req_manual } }] }
      updateQuery = { $inc: { manual: -1 } }
      console.log("manual update: second case")
    } else if (req_manual < old_manual && old_manual <= max_manual) {
      filterQuery = { $and: [{ manual: { $gte: req_manual } }, { manual: { $lt: old_manual } }] }
      updateQuery = { $inc: { manual: +1 } }
      console.log("manual update: third case")
    } else if (req_manual <= max_manual && max_manual < old_manual) {
      filterQuery = { $and: [{ manual: { $gte: req_manual } }, { manual: { $lte: max_manual } }] }
      updateQuery = { $inc: { manual: +1 } }
      console.log("manual update: forth case")
    } else if (old_manual <= max_manual && max_manual < req_manual) {
      filterQuery = { $and: [{ manual: { $gt: old_manual } }, { manual: { $lte: max_manual } }] }
      updateQuery = { $inc: { manual: -1 } }
      new_manual = max_manual
      console.log("manual update: fifth case")
    }
    
    if (filterQuery && updateQuery) {
      await this.auctionModel.updateMany(filterQuery, updateQuery, {})
    }
    
    const updated_auctions = await this.auctionModel.find({ manual: { $lt: 100 } }).exec();
    const updated_auctions_ids = updated_auctions.map((ua, i)=>ua.id);
    const updated_live_auctions = this.live_auctions.filter((lau, i) => (updated_auctions_ids.includes(lau.id)));
    updated_live_auctions.map((ula, i) => {
      ula.manual = updated_auctions.filter((ua, i) => (ua.id===ula.id))[0].manual          
      this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: ula, timestamp: new Date().getTime() }})
    })          
    
    const auctionUpdated = await this.auctionModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(auction_id),
      },
      {
        manual: new_manual,
      },
      {
        new: true,
      },
    );
    const liveUpdatedAuction = this.live_auctions.filter(
      (la) => la.id === auctionUpdated.id
    )[0];
    if (liveUpdatedAuction) {
      liveUpdatedAuction.manual = new_manual;  
      this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: liveUpdatedAuction, timestamp: new Date().getTime() } });  
    } 

    this.live_auctions.sort((a, b) => {
      return a.manual-b.manual;
    });

    return auctionUpdated;
  }

  async setTimer(auction_id: string, timer: number): Promise<IAuction> {
    const updatedAuction = await this.auctionModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(auction_id),
      },
      {
        timer,
        live_timer: timer,
      },
      {
        new: true,
      },
    );

    if (!updatedAuction) {
      this.logger.log("no updated auction for the set timer...");
      return null;
    }

    if (!this.live_auctions) {
      this.logger.log("no live auctions.");
      return null;
    }

    const liveUpdatedAuction = this.live_auctions.filter(
      (la) => la.id === updatedAuction.id,
    )[0];
    if (!liveUpdatedAuction) {
      this.logger.log("no live auction for the set timer result...");
      return null;
    }

    liveUpdatedAuction.timer = timer;
    liveUpdatedAuction.live_timer = timer;
    liveUpdatedAuction.state = "cool";

    this.pubSub.publish("auctionUpdated", { auctionUpdated: { auction: liveUpdatedAuction, timestamp: new Date().getTime() } });

    return liveUpdatedAuction;
  }

  /**
   * called when the manager input tracking number in the admin panel
   * @param id
   * @param state
   */
  async setTracking(id: string, tracking: string): Promise<ResType> {
    const cnt = await this.historyModel.countDocuments({ tracking }).exec();
    if (cnt > 0) {
      return { code: "error", message: "same tracking already exist!" };
    }

    const updatedHistory = await this.historyModel.findOneAndUpdate(
      {
        _id: new mongodb.ObjectID(id),
      },
      {
        tracking,
      },
      {
        new: true,
      },
    );

    return updatedHistory
      ? { code: "success", message: "" }
      : { code: "error", message: "failed to save the tracking!" };
  }

  async findHistoriesAll(
    pageArgs: PageArgs,
    filter: Filter,
  ): Promise<IFetchHistory> {
    const filterQuery = this.getFilter(filter);
    const filterSort = this.getSort(filter);

    const arr = await this.historyModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort: filterSort,
        },
      )
      .exec();

    const cnt = await this.historyModel.countDocuments(filterQuery).exec();

    return { arr, cnt };
  }

  /////////////////////////////messages////////////////////////////////
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

  async auction(auction_id: string): Promise<AuctionType> {
    if (!auction_id) {
      this.logger.error("no auction_id");
      return null;
    }
    const auction = await this.auctionModel.findOne({
      _id: new mongodb.ObjectID(auction_id),
    });
    if (!auction) {
      this.logger.error(`no auction for auction_id ${auction_id}`);
      return null;
    }

    return auction;
  }

  async history(history_id: string): Promise<HistoryType> {
    if (!history_id) {
      this.logger.error("no history_id");
      return null;
    }
    const history = await this.historyModel.findOne({
      _id: new mongodb.ObjectID(history_id),
    });
    if (!history) {
      this.logger.error(`no history for history_id ${history_id}`);
      return null;
    }
    return history;
  }

  /////////////////////////////statistics/////////////////////////////////////////

  async currentStatistics(): Promise<CurrentStatisticsType> {
    if (!this.live_auctions || this.live_auctions.length === 0) {
      return { online_users: 0, online_bid_users: 0, bids_per_action: 0 };
    }
    const online_users_dup_arr = [];
    const online_bid_users_dup_arr = [];
    let total_bids = 0;
    this.live_auctions.map((la, idx) => {
      la.watchers.map((w, idy) => {
        online_users_dup_arr.push(w);
      });
      la.bidders.map((b, idy) => {
        online_bid_users_dup_arr.push(b.user.id);
      });
      total_bids += la.bidders.length;
    });
    const online_users_arr = [...new Set(online_users_dup_arr)];
    const online_bid_users_arr = [...new Set(online_bid_users_dup_arr)];

    const online_users = online_users_arr.length;
    const online_bid_users = online_users_arr.filter((ou) =>
      online_bid_users_arr.includes(ou),
    ).length;
    const bids_per_action = total_bids / this.live_auctions.length;

    return { online_users, online_bid_users, bids_per_action };
  }

  async historyStatistics(): Promise<HistoryStatisticsType> {
    const histories = await this.historyModel.find().exec();
    let total_bids = 0;
    histories.map((h, i) => {
      total_bids += h.bidders.length;
    });

    const total_actions = histories.length;
    const total_winners = new Set(histories.map((h) => h.winner.id)).size;
    const bids_per_action = total_bids / histories.length;

    const max_users = await this.getHistoryDailyMaxUser();

    return { total_actions, total_winners, max_users, bids_per_action };
  }

  @Interval(60 * 1000) //every minute
  async updateCurrentStatisticsState(): Promise<void> {
    const currentUpdated = await this.currentStatistics();
    this.pubSub.publish("currentUpdated", { currentUpdated });
  }

  @Interval(60 * 60 * 1000) //every hour
  async updateHistoryStatisticsState(): Promise<void> {
    const historyUpdated = await this.historyStatistics();
    this.pubSub.publish("historyUpdated", { historyUpdated });
  }

  async getHistoryDailyMaxUser(): Promise<number> {
    const res = await this.loginModel.aggregate([
      {
        $match: {
          // "created_at": { $gt: new Date(ISODate().getTime() - 1000 * 60 * 60 * 24 * 30) }//Get only records created in the last 30 days
        },
      },
      // Get the year, month and day from the createdTimeStamp
      {
        $project: {
          year: { $year: "$created_at" },
          month: { $month: "$created_at" },
          day: { $dayOfMonth: "$created_at" },
        },
      },
      // Group by year, month and day and get the count
      {
        $group: {
          _id: { year: "$year", month: "$month", day: "$day" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    return res[0].count;
  }
}

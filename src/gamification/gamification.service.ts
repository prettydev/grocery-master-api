import { Model } from "mongoose";
import { Inject, Injectable, HttpService, Logger } from "@nestjs/common";
import { Cron, Interval, Timeout, CronExpression } from "@nestjs/schedule";
import { PubSub } from "apollo-server-express";
import { InjectModel } from "@nestjs/mongoose";

import { IAuction, IHistory } from "../exhibits/db/exhibit.interface";
import { IUser } from "../users/db/user.interface";
import { IBadge } from "../badges/db/badge.interface";
import { IPoint } from "../points/db/point.interface";
import { ILogin } from "../logins/db/logins.interface";
import { INote } from "../notes/db/note.interface";

import { BadgesService } from "../badges/badges.service";
import { PointsService } from "../points/points.service";
import { LoginsService } from "../logins/logins.service";

const mongodb = require("mongodb");

interface IBidUnit {
  user_id: string;
  time: Date;
}

interface IOutbidUnit {
  user_id: string;
  auction_id: string;
}

@Injectable()
export class GamificationService {
  private readonly httpService: HttpService = new HttpService();
  private readonly logger = new Logger(GamificationService.name);

  public live_badges: IBadge[];

  private STRAGHT_WINS_CNT = 3;
  private WINNER_LIVE_DAYS = 7; // a week
  private LEGEND_MASTER_LIVE_DAYS = 56; // 8 weeks
  private LEGEND_THRESHOLD = 80; //legend percent threshold
  private MASTER_THRESHOLD = 90; //master percent limit
  private TIMER5_LIMIT = 5;
  private TIMER10_LIMIT = 10;
  private TIMER15_LIMIT = 15;

  private TOP_PERCENT = 1; //1% winners
  private TALENT_LIMIT = 10; //10 winners

  private REVEAL_HEART_BADGE = "5f2aeb180bb17b218886a053";
  private WINNER_BADGE = "5f2aec400bb17b218886a056";
  private LEGEND_BADGE = "5f2aec960bb17b218886a057";
  private MASTER_BADGE = "5f2aece30bb17b218886a058";
  private WINNER_STORY_BADGE = "5f2aed940bb17b218886a05a";
  private HIGH_FIVE_BADGE = "5f2aee220bb17b218886a05b";
  private CROWNING_BADGE = "5f2aee4c0bb17b218886a05c";

  private TRIPLE_COMBO_BADGE = "5f2af03f0bb17b218886a061";
  private DOUBLE_COMBO_BADGE = "5f2af0870bb17b218886a062";
  private POWERUP_BADGE = "5f2af0eb0bb17b218886a063";
  private POWERUP_2X_BADGE = "5f2af1440bb17b218886a064";
  private THROTTLE_POWERUP_3X_BADGE = "5f2af1ab0bb17b218886a065";

  private OUTBID_BADGE = [
    "5f2af1e30bb17b218886a066",
    "5f2af2820bb17b218886a067",
    "5f2af2b50bb17b218886a068",
  ];

  private GOOGLE_BADGE = "5f2af38f0bb17b218886a069";
  private FACEBOOK_BADGE = "5f2af3de0bb17b218886a06a";
  private EMAIL_BADGE = "5f2af5710bb17b218886a06d";
  private PHONE_BADGE = "5f2af5e00bb17b218886a06e";
  private PROFILE_BADGE = "5f2aed430bb17b218886a059";
  private AUTOBIDDER_BADGE = "5f2af6dd0bb17b218886a06f";

  private FRIENDING_BADGE = "5f2af8c40bb17b218886a073";
  private AFFILIATE_BADGE = "5f2af9130bb17b218886a074";

  private DAILY_USER_BADGE = "5f2afba40bb17b218886a07b";
  private DAILY_BIDDER_BADGE = "5f2afbf70bb17b218886a07c";
  private DAILY_WINNER_BADGE = "5f2afd3a0bb17b218886a07e";

  private TOP_WINNER_BADGE = "5f2b00df0bb17b218886a085"; //top 1% winners, TOP_PERCENT
  private TALENT_BADGE = "5f2af86a0bb17b218886a072"; //top 10 winners, TOP_LIMIT

  public bids_in_timer5: Array<IBidUnit> = [];
  public bids_in_timer10: Array<IBidUnit> = [];
  public bids_in_timer15: Array<IBidUnit> = [];

  public outbids: Array<IOutbidUnit> = [];

  constructor(
    @InjectModel("History") private readonly historyModel: Model<IHistory>,
    @InjectModel("Auction") private readonly auctionModel: Model<IAuction>,
    @InjectModel("User") private readonly userModel: Model<IUser>,
    @InjectModel("Badge") private readonly badgeModel: Model<IBadge>,
    @InjectModel("Point") private readonly pointModel: Model<IPoint>,
    @InjectModel("Login") private readonly loginModel: Model<ILogin>,
    @InjectModel("Note") private readonly noteModel: Model<INote>,
    @Inject("PUB_SUB") private pubSub: PubSub,

    private badgesService: BadgesService,
    private pointsService: PointsService,
    private loginsService: LoginsService,
  ) {
    this.loadBadges();
  }

  async loadBadges(): Promise<void> {
    this.live_badges = await this.badgesService.badges();
  }

  @Cron("0 0 0 * * 1") //monday 00:00:00
  async WeeklyUpdates() {
    await this.WeekWinner();
    await this.LegendAndMaster();

    await this.WeekDailyWinner();
    await this.WeekDailyBidder();
    await this.WeekDailyUser();

    await this.TopTalentWinner();
  }

  /**
   * Revealed Heart
   */
  async RevealedHeart(user_id: string): Promise<boolean> {
    const badge = await this.getBadge(this.REVEAL_HEART_BADGE);
    if (!badge) {
      return false;
    }
    const histories = await this.historyModel.find(
      {
        "bidders.user": {
          $eq: new mongodb.ObjectID(user_id),
        },
      },
      {},
      { sort: { created_at: -1 }, limit: this.STRAGHT_WINS_CNT },
    ).exec();

    if (!histories.length) {
      this.logger.log("no bid histories");
      return false;
    }

    const win_histories = histories.filter((h, idx) => h.winner.id === user_id);

    this.logger.warn(
      `total histories length is ${histories.length}, ${win_histories.length}`,
    );

    if (win_histories.length !== this.STRAGHT_WINS_CNT) {
      return false;
    }

    this.logger.log("passed the candidate test.");

    /////////////////////////-------------badge logic----------------//////////////////////

    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);

    return true;
  }

  /**
   * First, Second, Third Win
   */
  async FSTWin(user_id: string): Promise<boolean> {
    const first_badge = await this.getBadge(this.WINNER_STORY_BADGE);
    const second_badge = await this.getBadge(this.HIGH_FIVE_BADGE);
    const third_badge = await this.getBadge(this.CROWNING_BADGE);

    if (!first_badge || !second_badge || !third_badge) {
      return false;
    }

    const win_cnt = await this.historyModel
      .countDocuments({
        winner: {
          $eq: new mongodb.ObjectID(user_id),
        },
      })
      .exec();

    console.log("win_cnt:", win_cnt);

    if (win_cnt === 1) {
      await this.clearBadge(first_badge.id, user_id);
      await this.updateBadge(first_badge, user_id);
    } else if (win_cnt === 2) {
      await this.clearBadge(second_badge.id, user_id);
      await this.updateBadge(second_badge, user_id);
    } else if (win_cnt === 3) {
      await this.clearBadge(third_badge.id, user_id);
      await this.updateBadge(third_badge, user_id);
    } else {
      console.log(user_id, "user already winned more at least 3 times.");
    }

    return true;
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Winner Badge
   */
  async WeekWinner(): Promise<boolean> {
    const badge = await this.getBadge(this.WINNER_BADGE);
    if (!badge) {
      return false;
    }
    await this.clearBadges(badge.id);

    const histories = await this.historyModel.find({
      created_at: {
        $lt: new Date(),
        $gte: new Date(
          new Date().setDate(new Date().getDate() - this.WINNER_LIVE_DAYS),
        ),
      },
    }).exec();

    const winner_duplicate_list = [];
    histories.map((h, idx) => {
      winner_duplicate_list.push(h.winner.id);
    });

    const winner_list = [...new Set(winner_duplicate_list)];

    if (!winner_list.length) {
      this.logger.verbose("no winner badge candidates in the last week.");
      return false;
    }

    await this.updateBadges(winner_list, badge);

    return true;
  }

  /**
   * Week Everyday Winner Badge
   */
  // @Timeout(1000)
  async WeekDailyWinner(): Promise<boolean> {
    const badge = await this.getBadge(this.DAILY_WINNER_BADGE);
    if (!badge) {
      return false;
    }
    await this.clearBadges(badge.id);
    ////////////////////////////////////////////////////////////////////////////
    const histories = await this.historyModel.find({
      created_at: {
        $lt: new Date(),
        $gte: new Date(
          new Date().setDate(new Date().getDate() - this.WINNER_LIVE_DAYS),
        ),
      },
    }).exec();

    const winner_duplicate_list = [];
    histories.map((h, idx) => {
      winner_duplicate_list.push(h.winner.id);
    });

    const { a, b } = this.getCompressedArray(winner_duplicate_list);

    const count_ids = a.map((m, idx) => ({
      id: m,
      count: b[idx],
    }));

    // users that have 7 or more winner histories
    const filtered_ids = count_ids
      .filter((ca) => ca.count >= this.WINNER_LIVE_DAYS)
      .map((m) => m.id);

    const candidate_ids = [];

    filtered_ids.map((fi, idx) => {
      const created_at_arr = histories
        .filter((h) => fi === h.winner.id)
        .map((m) => m.created_at);
      // need to check if the filtered_arr contains all the seven days in a week
      const filtered_day_arr = created_at_arr.map(
        (f) => new Date().getDate() - f.getDate(),
      );
      const filter_day_arr = [...new Set(filtered_day_arr)]
        .filter((m) => m > 0)
        .sort();

      console.log(idx, "=>", filter_day_arr, filter_day_arr.length);

      if (filter_day_arr.length === this.WINNER_LIVE_DAYS) {
        candidate_ids.push(fi);
      }
    });
    //////////////////////////////////////////////////////////////////
    console.log("candidate_ids:::", candidate_ids);

    if (!candidate_ids.length) {
      this.logger.verbose("no daily winner badge candidates in the last week.");
      return false;
    }

    await this.updateBadges(candidate_ids, badge);
    return true;
  }

  /**
   * Week Everyday Bidder Badge
   */
  // @Timeout(1000)
  async WeekDailyBidder(): Promise<boolean> {
    const badge = await this.getBadge(this.DAILY_BIDDER_BADGE);
    if (!badge) {
      return false;
    }
    await this.clearBadges(badge.id);
    ////////////////////////////////////////////////////////////////////////////
    const histories = await this.historyModel.find({
      created_at: {
        $lt: new Date(),
        $gte: new Date(
          new Date().setDate(new Date().getDate() - this.WINNER_LIVE_DAYS),
        ),
      },
    }).exec();

    const auctions = await this.auctionModel.find({
      created_at: {
        $lt: new Date(),
        $gte: new Date(
          new Date().setDate(new Date().getDate() - this.WINNER_LIVE_DAYS),
        ),
      },
    }).exec();

    const histories_dup_bidders = [];
    histories.map((h, i) => {
      h.bidders.map((b, j) => {
        histories_dup_bidders.push(b.user.id);
      });
    });

    const auctions_dup_bidders = [];
    auctions.map((h, i) => {
      h.bidders.map((b, j) => {
        auctions_dup_bidders.push(b.user.id);
      });
    });

    const union_dup_bidders = [
      ...histories_dup_bidders,
      ...auctions_dup_bidders,
    ];

    console.log(histories_dup_bidders.length, auctions_dup_bidders.length);

    const { a, b } = this.getCompressedArray(union_dup_bidders);

    const count_ids = a.map((m, idx) => ({
      id: m,
      count: b[idx],
    }));

    // users that have 7 or more winner histories
    const filtered_ids = count_ids
      .filter((ca) => ca.count >= this.WINNER_LIVE_DAYS)
      .map((m) => m.id);

    const candidate_ids = [];

    filtered_ids.map((fi, idx) => {
      const histories_created_at_arr = histories
        .filter((h) => !!h.bidders.filter((hb) => hb.user.id === fi)[0])
        .map((m) => m.created_at);
      const auctions_created_at_arr = auctions
        .filter((h) => !!h.bidders.filter((hb) => hb.user.id === fi)[0])
        .map((m) => m.created_at);

      const union_created_at_arr = [
        ...histories_created_at_arr,
        ...auctions_created_at_arr,
      ];

      // need to check if the filtered_arr contains all the seven days in a week
      const filtered_day_arr = union_created_at_arr.map(
        (f) => new Date().getDate() - f.getDate(),
      );
      const filter_day_arr = [...new Set(filtered_day_arr)]
        .filter((m) => m > 0)
        .sort();

      console.log(idx, "=>", filter_day_arr, filter_day_arr.length);

      if (filter_day_arr.length === this.WINNER_LIVE_DAYS) {
        candidate_ids.push(fi);
      }
    });
    //////////////////////////////////////////////////////////////////
    console.log("daily bidder candidate_ids:::", candidate_ids);

    if (!candidate_ids.length) {
      this.logger.verbose("no daily bidder badge candidates in the last week.");
      return false;
    }

    await this.updateBadges(candidate_ids, badge);
    return true;
  }

  /**
   * Week Daily Login User Badge
   */

  async WeekDailyUser(): Promise<boolean> {
    const badge = await this.getBadge(this.DAILY_USER_BADGE);
    if (!badge) {
      return false;
    }
    await this.clearBadges(badge.id);
    ////////////////////////////////////////////////////////////////////////////
    const logins = await this.loginModel.find({
      created_at: {
        $lt: new Date(),
        $gte: new Date(
          new Date().setDate(new Date().getDate() - this.WINNER_LIVE_DAYS),
        ),
      },
    }).exec();

    const logins_duplicate_list = [];
    logins.map((h, idx) => {
      logins_duplicate_list.push(h.user_id);
    });

    const { a, b } = this.getCompressedArray(logins_duplicate_list);

    const count_ids = a.map((m, idx) => ({
      id: m,
      count: b[idx],
    }));

    // users that have 7 or more winner histories
    const filtered_ids = count_ids
      .filter((ca) => ca.count >= this.WINNER_LIVE_DAYS)
      .map((m) => m.id);

    console.log("filtered_ids ::: ", filtered_ids);

    const candidate_ids = [];

    filtered_ids.map((fi, idx) => {
      const created_at_arr = logins
        .filter((h) => fi === h.user_id)
        .map((m) => m.created_at);
      // need to check if the filtered_arr contains all the seven days in a week
      const filtered_day_arr = created_at_arr.map(
        (f) => new Date().getDate() - f.getDate(),
      );
      const filter_day_arr = [...new Set(filtered_day_arr)]
        .filter((m) => m > 0)
        .sort();

      console.log(idx, "=>", filter_day_arr, filter_day_arr.length);

      if (filter_day_arr.length === this.WINNER_LIVE_DAYS) {
        candidate_ids.push(fi);
      }
    });
    //////////////////////////////////////////////////////////////////
    console.log("daily user candidate_ids:::", candidate_ids);

    if (!candidate_ids.length) {
      this.logger.verbose("no daily user badge candidates in the last week.");
      return false;
    }

    await this.updateBadges(candidate_ids, badge);
    return true;
  }

  /**
   * Top Winner Badge
   */

  async TopTalentWinner(): Promise<boolean> {
    const top_badge = await this.getBadge(this.TOP_WINNER_BADGE);
    const talent_badge = await this.getBadge(this.TALENT_BADGE);
    if (!top_badge || !talent_badge) {
      return false;
    }
    await this.clearBadges(top_badge.id);
    await this.clearBadges(talent_badge.id);
    ////////////////////////////////////////////////////////////////////////////
    const histories = await this.historyModel.find({}).exec();

    const winner_duplicate_list = [];
    histories.map((h, idx) => {
      winner_duplicate_list.push(h.winner.id);
    });

    const top_candidate_ids = [...new Set(winner_duplicate_list)];

    const condition = {
      $or: top_candidate_ids.map((uid, idx) => ({
        _id: new mongodb.ObjectID(uid),
      })),
    };

    let top_limit = Math.round(
      (top_candidate_ids.length * this.TOP_PERCENT) / 100,
    );
    if (top_limit === 0) {
      top_limit = 1;
    }

    console.log("candidate_ids:::", top_candidate_ids, top_limit);

    const top_winners = await this.userModel.find(
      condition,
      {},
      { sort: { points: -1 }, limit: top_limit },
    ).exec();

    const talent_winners = await this.userModel.find(
      condition,
      {},
      { sort: { points: -1 }, limit: this.TALENT_LIMIT },
    ).exec();

    const top_winner_ids = top_winners.map((tw) => tw.id);
    const talent_winner_ids = talent_winners.map((tw) => tw.id);

    console.log(
      "top_winner, talent_winner ",
      top_winner_ids,
      talent_winner_ids,
    );

    if (!top_winner_ids.length) {
      this.logger.verbose("no top 1% winner badge candidates.");
    } else {
      await this.updateBadges(top_winner_ids, top_badge);
    }

    if (!talent_winner_ids.length) {
      this.logger.verbose("no top 10 winner badge candidates.");
    } else {
      await this.updateBadges(talent_winner_ids, talent_badge);
    }

    return true;
  }

  /**
   * Legend Badge
   */

  async LegendAndMaster(): Promise<boolean> {
    const legend_badge = await this.getBadge(this.LEGEND_BADGE);
    const master_badge = await this.getBadge(this.MASTER_BADGE);
    if (!legend_badge || !master_badge) {
      return false;
    }
    await this.clearBadges(legend_badge.id);
    await this.clearBadges(master_badge.id);

    const histories = await this.historyModel.find({
      created_at: {
        $lt: new Date(),
        $gte: new Date(
          new Date().setDate(
            new Date().getDate() - this.LEGEND_MASTER_LIVE_DAYS,
          ),
        ),
      },
    }).exec();

    const winner_duplicate_list = [];
    histories.map((h, idx) => {
      winner_duplicate_list.push(h.winner.id);
    });

    const { legendArray, masterArray } = this.getLegendAndMasterArray(
      winner_duplicate_list,
    );

    console.log("legend_ids ", legendArray);
    console.log("master_ids ", masterArray);

    if (!legendArray.length) {
      this.logger.verbose("no legend badge candidates in the last 8 weeks.");
    } else {
      await this.updateBadges(legendArray, legend_badge);
    }

    if (!masterArray.length) {
      this.logger.verbose("no master badge candidates in the last 8 weeks.");
    } else {
      await this.updateBadges(masterArray, master_badge);
    }

    return true;
  }

  ///////////////////////////--------------gamification for combos-----------------/////////////////////////////

  /**
   * called from the bid function
   * @param user_id
   */
  async CalcCombosOutbid(user_id: string, auction_id: string): Promise<any> {
    console.log("start to calc the combos...", user_id);
    await this.CalcCombos(user_id);
    await this.CalcOutbid(user_id, auction_id);
  }

  async CalcCombos(user_id: string): Promise<any> {
    console.log("start to calc the combos...", user_id);
    await this.pushBidData(user_id);
    await this.filterBidsByTimedUser(user_id);
    await this.doComboProc(user_id);
  }

  /**
   *
   * @param user_id
   */
  async CalcOutbid(user_id: string, auction_id: string): Promise<any> {
    console.log("start to calc the outbids...", user_id, auction_id);
    const lastBid = { user_id, auction_id };
    this.outbids.push(lastBid);
    if (this.outbids.length > 4) {
      this.outbids.shift();
    }
    if (this.outbids.length === 2) {
      if (
        this.outbidCompare(this.outbids[0], lastBid) &&
        this.outbidCompare(this.outbids[1], lastBid)
      ) {
        this.Outbid(user_id, 0); //outbid1
      } else {
        console.log("no recorded the outbid1, ", this.outbids);
      }
    } else if (this.outbids.length === 3) {
      if (
        this.outbidCompare(this.outbids[0], lastBid) &&
        this.outbidCompare(this.outbids[1], lastBid) &&
        this.outbidCompare(this.outbids[2], lastBid)
      ) {
        this.Outbid(user_id, 1); //outbid 2 times
      } else if (
        this.outbidCompare(this.outbids[1], lastBid) &&
        this.outbidCompare(this.outbids[2], lastBid)
      ) {
        this.Outbid(user_id, 0); //outbid1
      } else {
        console.log("no recorded the outbid2, ", this.outbids);
      }
    } else if (this.outbids.length === 4) {
      if (
        this.outbidCompare(this.outbids[0], lastBid) &&
        this.outbidCompare(this.outbids[1], lastBid) &&
        this.outbidCompare(this.outbids[2], lastBid) &&
        this.outbidCompare(this.outbids[3], lastBid)
      ) {
        this.Outbid(user_id, 2); //outbid 3 times
      } else if (
        this.outbidCompare(this.outbids[1], lastBid) &&
        this.outbidCompare(this.outbids[2], lastBid) &&
        this.outbidCompare(this.outbids[3], lastBid)
      ) {
        this.Outbid(user_id, 1); //outbid 2 times
      } else if (
        this.outbidCompare(this.outbids[2], lastBid) &&
        this.outbidCompare(this.outbids[3], lastBid)
      ) {
        this.Outbid(user_id, 0); //outbid1
      } else {
        console.log("no recorded the outbid3, ", this.outbids);
      }
    } else {
      console.log("no recorded the outbid, ", this.outbids);
    }
  }

  outbidCompare(outbid1: IOutbidUnit, outbid2: IOutbidUnit): boolean {
    if (!outbid1 || !outbid2) {
      return false;
    }
    if (
      outbid1.auction_id === outbid2.auction_id &&
      outbid1.user_id === outbid2.user_id
    ) {
      return true;
    }
    return false;
  }

  async Outbid(user_id: string, times: number): Promise<any> {
    if (times < 0 || times > 2) {
      console.log("wrong outbid index, ", times);
      return;
    }
    const badge = await this.getBadge(this.OUTBID_BADGE[times]); //PowerUp 3X Combo
    if (!badge) {
      return false;
    }
    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);
    return;
  }

  /**
   * Push bids for combos, outbids
   * @param user_id
   */
  async pushBidData(user_id: string): Promise<any> {
    this.bids_in_timer5.push({
      time: new Date(),
      user_id,
    });
    this.bids_in_timer10.push({
      time: new Date(),
      user_id,
    });
    this.bids_in_timer15.push({
      time: new Date(),
      user_id,
    });

    return;
  }

  /**
   * Filter combos by time and user
   */
  async filterBidsByTimedUser(user_id: string): Promise<any> {
    this.bids_in_timer5 = this.bids_in_timer5.filter(
      (d) =>
        Math.abs(new Date().getSeconds() - d.time.getSeconds()) <
          this.TIMER5_LIMIT && d.user_id === user_id,
    );
    this.bids_in_timer10 = this.bids_in_timer10.filter(
      (d) =>
        Math.abs(new Date().getSeconds() - d.time.getSeconds()) <
          this.TIMER10_LIMIT && d.user_id === user_id,
    );
    this.bids_in_timer15 = this.bids_in_timer15.filter(
      (d) =>
        Math.abs(new Date().getSeconds() - d.time.getSeconds()) <
          this.TIMER15_LIMIT && d.user_id === user_id,
    );

    return;
  }

  /***
   * Combos
   */
  async doComboProc(user_id: string): Promise<any> {
    let badge = null;

    if (this.bids_in_timer15.length === 8) {
      badge = await this.getBadge(this.THROTTLE_POWERUP_3X_BADGE); //PowerUp 3X Combo
      console.log(
        "recorded powerup3x combo, bids_in_timer15",
        this.bids_in_timer15,
      );
    } else if (this.bids_in_timer10.length === 6) {
      badge = await this.getBadge(this.POWERUP_2X_BADGE); //PowerUp 2X Combo
      console.log(
        "recorded powerup2x combo, bids_in_timer10",
        this.bids_in_timer10,
      );
    } else if (this.bids_in_timer10.length === 4) {
      badge = await this.getBadge(this.POWERUP_BADGE); //PowerUp Combo
      console.log(
        "recorded powerup combo, bids_in_timer10",
        this.bids_in_timer10,
      );
    } else if (this.bids_in_timer10.length === 3) {
      badge = await this.getBadge(this.TRIPLE_COMBO_BADGE); //Triple Combo
      console.log(
        "recorded double combo, bids_in_timer10",
        this.bids_in_timer10,
      );
    } else if (this.bids_in_timer5.length === 2) {
      badge = await this.getBadge(this.DOUBLE_COMBO_BADGE); //Double Combo
      console.log("recorded triple combo, bids_in_timer5", this.bids_in_timer5);
    }

    if (!badge) {
      return false;
    }
    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);

    return;
  }

  ///////////////////////////-------Auth related-----------/////////////////////////////////
  async SocialBadge(user_id: string, key: string): Promise<boolean> {
    console.log("social badge process...", user_id, key);
    let badge = null;
    if (key === "google") {
      this.logger.verbose("google gamification.");
      badge = await this.getBadge(this.GOOGLE_BADGE);
    } else if (key === "facebook") {
      this.logger.verbose("facebook gamification.");
      badge = await this.getBadge(this.FACEBOOK_BADGE);
    } else {
      this.logger.error("wrong social key for gamification.");
      return false;
    }
    if (!badge) {
      return false;
    }
    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);
    return true;
  }

  /**
   * Email verification badge, called from the email auth proc
   * @param user_id
   */
  async EmailBadge(user_id: string): Promise<boolean> {
    const badge = await this.getBadge(this.EMAIL_BADGE);
    if (!badge) {
      return false;
    }

    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);

    return true;
  }

  /**
   * Phone verification badge, called from the email auth proc
   * @param user_id
   */
  async PhoneBadge(user_id: string): Promise<boolean> {
    const badge = await this.getBadge(this.PHONE_BADGE);
    if (!badge) {
      return false;
    }

    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);

    return true;
  }

  /**
   * Profile 100% badge, called from google, facebook, email badge call functions
   * @param user_id
   */
  async ProfileBadge(user_id: string): Promise<boolean> {
    const badge = await this.getBadge(this.PROFILE_BADGE);
    if (!badge) {
      return false;
    }

    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);

    return true;
  }

  /**
   * Profile 100%, auto bidder
   * @param user_id
   */
  async AutoBidderBadge(user_id: string): Promise<boolean> {
    const badge = await this.getBadge(this.AUTOBIDDER_BADGE);
    if (!badge) {
      return false;
    }

    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);

    return true;
  }

  /**
   * @param user_id
   */
  async FriendingBadge(user_id: string): Promise<boolean> {
    const badge = await this.getBadge(this.FRIENDING_BADGE);
    if (!badge) {
      return false;
    }

    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);

    return true;
  }

  /**
   * @param user_id
   */
  async AffiliateBadge(user_id: string): Promise<boolean> {
    const badge = await this.getBadge(this.AFFILIATE_BADGE);
    if (!badge) {
      return false;
    }

    await this.clearBadge(badge.id, user_id);
    await this.updateBadge(badge, user_id);

    return true;
  }

  ///////////////////////////////--------utils---------/////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////

  async getBadge(badge_id: string): Promise<IBadge> {
    if (!this.live_badges || !this.live_badges.length) {
      await this.loadBadges();
    }
    const badge: IBadge = this.live_badges.filter((b) => b.id === badge_id)[0];
    if (!badge) {
      this.logger.error(`badge error for ${badge_id}`);
    }
    return badge;
  }

  /**
   * remove single badge for the user
   */
  async clearBadge(badge_id: string, user_id: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: new mongodb.ObjectID(user_id) },
      {
        $pull: {
          badges: { badge: new mongodb.ObjectID(badge_id) },
        },
      },
      { new: true },
    );
  }

  /**
   * remove all the winner badges from the all users
   */
  async clearBadges(badge_id: string): Promise<void> {
    await this.userModel.updateMany(
      {},
      {
        $pull: {
          badges: { badge: new mongodb.ObjectID(badge_id) },
        },
      },
      { multi: true },
    );
  }

  /**
   * update single user badge
   */
  async updateBadge(badge: IBadge, user_id: string): Promise<void> {
    const userUpdated = await this.userModel.findOneAndUpdate(
      { _id: new mongodb.ObjectID(user_id) },
      {
        $inc: { points: badge.points },
        $push: {
          badges: {
            $each: [
              {
                badge: new mongodb.ObjectId(badge.id),
                created_at: new Date(),
              },
            ],
            $position: 0,
          },
        },
      },
      { new: true },
    );

    const points_log = {
      user_id,
      points: badge.points,
      comment: `Bonus points for ${badge.title}`,
    };
    this.pointsService.create(points_log);

    this.pubSub.publish("userUpdated", { userUpdated });
    this.pubSub.publish("gameUpdated", { gameUpdated: { userUpdated, badge } });

    this.noteModel.create({
      content: `You received ${badge.title} badge with ${badge.points}points!`,
      receivers: [user_id],
    });
  }

  /**
   * update badges
   */
  async updateBadges(user_arr: Array<any>, badge: IBadge): Promise<void> {
    const condition = {
      $or: user_arr.map((wid, idx) => ({
        _id: new mongodb.ObjectID(wid),
      })),
    };
    await this.userModel.updateMany(condition, {
      $inc: { points: badge.points },
      $push: {
        badges: {
          $each: [
            {
              badge: new mongodb.ObjectID(badge.id),
              created_at: new Date(),
            },
          ],
          $position: 0, //insert to the first position
        },
      },
    });

    //////////////////add to the points log////////////////////////////////////////////////

    const points_log_arr = user_arr.map((user_id, idx) => ({
      user_id,
      points: badge.points,
      comment: `Bonus points for ${badge.title}`,
    }));
    this.pointsService.creates(points_log_arr);

    //////////////////////////////////////////////////////////////////////////////
    //////////////////add to notes////////////////////////////////////////////////

    const notes_arr = user_arr.map((user_id, idx) => ({
      content: `You received ${badge.title} badge with ${badge.points}points!`,
      receivers: [user_id],
    }));

    try {
      this.noteModel.insertMany(notes_arr);
    } catch (e) {
      console.log("exception for inserting multiple points...", e.toString());
    }
    //////////////////////////////////////////////////////////////////////////////////
  }

  getLegendAndMasterArray(arr: Array<any>): any {
    const { a, b } = this.getCompressedArray(arr);

    const total = arr.length;

    const percent_arr = a.map((m, idx) => ({
      id: m,
      percent: (b[idx] * 100) / total,
    }));
    const legendArray = percent_arr.filter(
      (pa) =>
        pa.percent > this.LEGEND_THRESHOLD &&
        pa.percent <= this.MASTER_THRESHOLD,
    );
    const masterArray = percent_arr.filter(
      (pa) => pa.percent > this.MASTER_THRESHOLD,
    );

    console.log("legendArray for the last 8 weeks:", legendArray);
    console.log("masterArray for the last 8 weeks:", masterArray);

    return {
      legendArray: legendArray.map((la) => la.id),
      masterArray: masterArray.map((ma) => ma.id),
    };
  }

  /**
   * count duplicates
   * @param arr
   */
  getCompressedArray(arr: Array<any>): any {
    const a = [],
      b = [];
    let prev;

    arr.sort();
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== prev) {
        a.push(arr[i]);
        b.push(1);
      } else {
        b[b.length - 1]++;
      }
      prev = arr[i];
    }
    console.log("compress results are ", a, b);
    return { a, b };
  }
}

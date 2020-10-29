import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import * as dotenv from "dotenv";
import { ResType } from "src/gql_common/types/common.object";

dotenv.config();

const twilioClient = null;//require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

interface IToken {
  user_id: string;
  phone: string;
  token: number;
  time: Date;
}

@Injectable()
export class OtpsService {
  public tokens: Array<IToken> = [];

  private readonly logger = new Logger(OtpsService.name);

  public token_live_time = 1000 * 60 * 5; //5min

  @Interval(1000 * 60)
  async filterTokens(): Promise<void> {
    this.tokens = this.tokens.filter(
      (t) => new Date().getTime() - t.time.getTime() < this.token_live_time,
    );

    return;
  }

  async sendSMS(user_id: string, phone: string): Promise<ResType> {
    if (!phone || !user_id) {
      console.log("wrong phone number", user_id, phone);
      return {code:"error", message:`Please type the phone number`};
    }

    const token = Math.floor(10000 + Math.random() * 90000);

    console.log("token for sms authentication:", token);

    const currentToken = {
      user_id,
      phone,
      token,
      time: new Date(),
    };

    this.tokens.push(currentToken);

    try {
      const res = await twilioClient.messages.create({
        body: "test message from the exhibia dev team, please ignore this.",
        from: process.env.TWILIO_FROM,
        to: `+${phone }`
      })

      this.logger.verbose(`Otp sent result:`, res.toString());
      return {code:"success"};
    } catch (e) {      
      return {code:"error", message: e.toString()};
    }
  }  
}

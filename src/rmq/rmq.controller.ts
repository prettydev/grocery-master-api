import { Body, Controller, HttpCode, Post, Query } from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  EventPattern,
  MessagePattern,
  Transport,
} from "@nestjs/microservices";
import { from, Observable, of } from "rxjs";
import { scan } from "rxjs/operators";

import * as dotenv from "dotenv";
dotenv.config();

@Controller("rmq")
export class RMQController {
  static IS_NOTIFIED = false;

  client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.rmq_url],
        queue: "exhibia",
        queueOptions: { durable: false },
        socketOptions: { noDelay: true },
      },
    });
  }

  @Post()
  @HttpCode(200)
  call(@Query("command") cmd, @Body() data: number[]) {
    return this.client.send<number>({ cmd }, data);
  }

  @Post("stream")
  @HttpCode(200)
  stream(@Body() data: number[]): Observable<number> {
    return this.client
      .send<number>({ cmd: "streaming" }, data)
      .pipe(scan((a, b) => a + b));
  }

  @Post("concurrent")
  @HttpCode(200)
  concurrent(@Body() data: number[][]): Promise<boolean> {
    const send = async (tab: number[]) => {
      const expected = tab.reduce((a, b) => a + b);
      const result = await this.client
        .send<number>({ cmd: "sum" }, tab)
        .toPromise();

      return result === expected;
    };
    return data
      .map(async (tab) => send(tab))
      .reduce(async (a, b) => (await a) && b);
  }

  @MessagePattern({ cmd: "sum" })
  sum(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }

  @MessagePattern({ cmd: "asyncSum" })
  async asyncSum(data: number[]): Promise<number> {
    return (data || []).reduce((a, b) => a + b);
  }

  @MessagePattern({ cmd: "streamSum" })
  streamSum(data: number[]): Observable<number> {
    return of((data || []).reduce((a, b) => a + b));
  }

  @MessagePattern({ cmd: "streaming" })
  streaming(data: number[]): Observable<number> {
    return from(data);
  }

  @Post("notify")
  async sendNotification(): Promise<any> {
    return this.client.emit<number>("notification", true);
  }

  @EventPattern("notification")
  async eventHandler(data: Record<string, unknown>) {
    console.log("@@@@@@@@@@@@@@@@@@@@", data);
    // RMQController.IS_NOTIFIED = data;
  }
}

import { Controller, Get } from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  MessagePattern,
  Transport,
} from "@nestjs/microservices";
import { Observable } from "rxjs";
import { scan, take } from "rxjs/operators";
import * as dotenv from "dotenv";
dotenv.config();

@Controller()
export class RMQBroadcastController {
  client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.rmq_url],
        queue: "test_broadcast",
        queueOptions: { durable: false },
        socketOptions: { noDelay: true },
      },
    });
  }

  @Get("broadcast")
  multicats() {
    return this.client.send<number>({ cmd: "broadcast" }, {}).pipe(
      scan((a, b) => a + b),
      take(2),
    );
  }

  @MessagePattern({ cmd: "broadcast" })
  replyBroadcast(): Observable<number> {
    return new Observable((observer) => observer.next(1));
  }
}

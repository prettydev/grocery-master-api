import { Global, Module } from "@nestjs/common";
import { PubSub } from "apollo-server-express";

import { ClientProxyFactory, Transport } from "@nestjs/microservices";

import * as dotenv from "dotenv";
dotenv.config();

@Global()
@Module({
  providers: [
    {
      provide: "PUB_SUB",
      useValue: new PubSub(),
    },
    {
      provide: "MQ_PUB",
      useValue: ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [process.env.rmq_url],
          queue: "exhibia",
          queueOptions: { durable: false },
          socketOptions: { noDelay: true },
        },
      }),
    },
  ],
  exports: ["PUB_SUB", "MQ_PUB"],
})
export class PubSubModule {}

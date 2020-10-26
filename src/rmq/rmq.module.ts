import { Module } from "@nestjs/common";
import { RMQController } from "./rmq.controller";
import { RMQBroadcastController } from "./rmq-broadcast.controller";

@Module({
  controllers: [RMQController, RMQBroadcastController],
})
export class RmqModule {}

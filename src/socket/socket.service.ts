import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class SocketService {
  public socket: Server = null;

  sendMessage(cmd: string, data: any): void {
    this.socket.emit("msgToClient", {
      cmd,
      data,
    });
  }
}

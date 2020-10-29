import {
  Controller,
  Get,
  Param,
  Res,  
} from "@nestjs/common";

import { AppService } from "./app.service";
import { GroceriesService } from "./exhibits/groceries.service";
const fs = require("fs");

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productsService: GroceriesService,
  ) {}

  ///////////////////////////////////////////////////////////////////////

  @Get("hello")
  hello(): string {
    return this.appService.getHello();
  }

  /**
   * not used
   * @param avatar
   * @param res
   */
  @Get("avatar/:avatar")
  async downloadFile(@Param("avatar") avatar, @Res() res): Promise<any> {
    res.setHeader("Content-Type", "application/octet-stream");
    return res.sendFile(`d:\\uploads\\${avatar}`);
  }
}

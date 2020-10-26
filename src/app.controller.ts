import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AppService } from "./app.service";
import { ProductsService } from "./exhibits/products.service";
import { ProductType } from "./exhibits/gql/product.dto";
import { ResType } from "./gql_common/types/common.object";
const fs = require("fs");

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productsService: ProductsService,
  ) {}

  ///////////////////////////////////////////////////////////////////////

  @Get("hello")
  hello(): string {
    return this.appService.getHello();
  }

  /**
   * used to upload bulk product file
   * @param file
   */
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file): Promise<ResType> {
    let rawdata = fs.readFileSync(file.path);
    let products: Array<ProductType> = JSON.parse(rawdata);
    return this.productsService.admin_bulk_add_product(products);
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

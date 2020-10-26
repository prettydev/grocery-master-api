import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductsService } from "./products.service";

const fs = require("fs");

@Controller("exhibits")
export class ExhibitsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * not used
   * @param file
   */
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file): Promise<string> {
    console.log(":", file);

    // console.log("file:", file);

    // let rawdata = fs.readFileSync(file.path);
    // let products = JSON.parse(rawdata);

    // return this.productsService.admin_bulk_add_product(products);

    return file.path;
  }
}

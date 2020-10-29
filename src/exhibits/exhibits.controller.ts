import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { GroceriesService } from "./groceries.service";

const fs = require("fs");

@Controller("exhibits")
export class ExhibitsController {
  constructor(private readonly productsService: GroceriesService) {}

  /**
   * not used
   * @param file
   */
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file): Promise<string> {
    return file.path;
  }
}

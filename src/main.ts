import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as helmet from "helmet";
import * as dotenv from "dotenv";
import * as fs from "fs";

import { AppModule } from "./app.module";

const httpsOptions = {
  key: fs.readFileSync("./certificates/byebyegrocery.online.key"),
  cert: fs.readFileSync("./certificates/byebyegrocery.online.crt"),
};

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors();
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 8000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

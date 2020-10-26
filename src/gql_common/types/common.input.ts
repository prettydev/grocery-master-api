import { ArgsType, ID, InputType, Field, Int } from "@nestjs/graphql";
import { Max, Min } from "class-validator";

@ArgsType()
@InputType()
export class PageArgs {
  @Field((type) => Int)
  @Min(0)
  skip: number;

  @Field((type) => Int)
  @Min(1)
  @Max(500)
  take: number;
}

@ArgsType()
@InputType()
export class Filter {
  @Field((type) => String)
  key: string;

  @Field((type) => String)
  sort: string;

  @Field((type) => String)
  order?: string; //asc

  @Field((type) => String)
  cat: string;
}

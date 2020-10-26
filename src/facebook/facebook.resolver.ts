import { NotFoundException, Inject, Logger } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { FacebookService } from "./facebook.service";

import { Filter, PageArgs } from "src/gql_common/types/common.input";
import { FetchFBPostType } from "./gql/facebook.dto";

@Resolver("Facebook")
export class FacebookResolver {
  private readonly logger = new Logger(FacebookResolver.name);

  constructor(
    private readonly facebookService: FacebookService,
    @Inject("PUB_SUB") private pubSub: PubSub, // @Inject("MQ_PUB") private mqPub: ClientProxy,
  ) {}

  @Query((returns) => FetchFBPostType)
  async fb_posts(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchFBPostType> {
    console.log("request for fb_posts");

    const res = await this.facebookService.getPosts(pageArgs, filter);

    return res;
  }
}

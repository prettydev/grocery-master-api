import { NotFoundException, Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { PageArgs, Filter } from "../gql_common/types/common.input";
import { BadgeType, FetchBadgeType, BadgeResultType } from "./gql/badge.dto";
import { NewBadgeInput } from "./gql/new-badge.input";
import { BadgesService } from "./badges.service";

// @Resolver("Orders")
@Resolver((of) => BadgeType)
export class BadgesResolver {
  constructor(
    private readonly badgesService: BadgesService,
    @Inject("PUB_SUB") private pubSub: PubSub,
  ) {}

  //still not used
  @Query((returns) => BadgeType)
  async badge_details(@Args("badge_id") badge_id: string): Promise<BadgeType> {
    const product = await this.badgesService.find(badge_id);
    if (!product) {
      throw new NotFoundException(badge_id);
    }
    return product;
  }

  @Mutation((returns) => BadgeResultType)
  async addBadge(
    @Args("input") newBadgeInput: NewBadgeInput,
  ): Promise<BadgeResultType> {
    const badgeResult = await this.badgesService.create(newBadgeInput);
    // pubSub.publish("badgeAdded", { badgeAdded: badgeUser });
    return badgeResult;
  }

  @Mutation((returns) => BadgeResultType)
  async editBadge(
    @Args("badge_id") badge_id: string,
    @Args("input") newBadgeInput: NewBadgeInput,
  ): Promise<BadgeResultType> {
    const badgeResult = await this.badgesService.update(
      badge_id,
      newBadgeInput,
    );
    // pubSub.publish("badgeAdded", { badgeAdded: badgeUser });

    console.log(badgeResult, "badgeResult............");

    return badgeResult;
  }

  @Query((returns) => FetchBadgeType)
  badges(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchBadgeType> {
    return this.badgesService.findAll(pageArgs, filter);
  }
}

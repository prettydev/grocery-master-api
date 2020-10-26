import { NotFoundException, Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { PageArgs, Filter } from "../gql_common/types/common.input";
import {
  PointType,
  PointUserType,
  FetchPointType,
  PointResultType,
} from "./gql/point.dto";
import { NewPointInput } from "./gql/new-point.input";
import { PointsService } from "./points.service";

// @Resolver("Orders")
@Resolver((of) => PointType)
export class PointsResolver {
  constructor(
    private readonly pointsService: PointsService,
    @Inject("PUB_SUB") private pubSub: PubSub,
  ) {}

  @Mutation((returns) => PointResultType)
  async addPoint(
    @Args("input") newPointInput: NewPointInput,
  ): Promise<PointResultType> {
    const pointResult = await this.pointsService.create(newPointInput);
    return pointResult;
  }

  @Query((returns) => FetchPointType)
  points(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
  ): Promise<FetchPointType> {
    return this.pointsService.findAll(pageArgs, filter);
  }

  @Query((returns) => Number)
  getBonus(@Args("user_id") user_id: string): Promise<number> {
    return this.pointsService.getBonus(user_id);
  }
}

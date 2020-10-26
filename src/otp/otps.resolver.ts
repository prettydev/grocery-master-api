import { Logger } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ResType } from "src/gql_common/types/common.object";
import { OtpsService } from "./otps.service";

@Resolver()
export class OtpsResolver {
  private readonly logger = new Logger(OtpsResolver.name);

  constructor(
    private readonly otpsService: OtpsService,
  ) {}

  @Mutation((returns) => ResType)
  async sendSMS(
    @Args("user_id") user_id: string,
    @Args("phone") phone: string,
  ): Promise<ResType> {
    return await this.otpsService.sendSMS(user_id, phone);
  }  
}

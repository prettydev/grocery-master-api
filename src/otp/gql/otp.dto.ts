import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OtpType {
  @Field((type) => ID)
  id: string;

  @Field((type) => String)
  phone: string;

  @Field((type) => String)
  otp: string;

  @Field((type) => Date)
  created_at: Date;
}
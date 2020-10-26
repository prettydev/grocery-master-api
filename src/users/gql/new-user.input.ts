import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, Length, MaxLength } from "class-validator";

@InputType()
export class InputBadge {
  @Field()
  title: string; //email, phone, google, facebook, twitter

  @Field()
  account: string;

  @Field({ nullable: true })
  verified_at: Date;
}

@InputType()
export class NewUserInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  plan: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(10, 255)
  avatar?: string;

  // @Field((type) => [InputBadge])
  // badges: InputBadge[];
}

@InputType()
export class LoginUserInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class SocialBody {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  image: string;
}

@InputType()
export class Social {
  @Field()
  key: string;

  @Field((type) => SocialBody)
  value: SocialBody;
}

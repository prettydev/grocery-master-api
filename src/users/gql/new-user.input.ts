import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, Length, MaxLength } from "class-validator";

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

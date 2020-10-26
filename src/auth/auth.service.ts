import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { LoginType, UserType } from "../users/gql/user.dto";

const bcrypt = require("bcrypt");

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserType> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      console.log("incorrect email, ", email);
      return null;
    }
    const message = await bcrypt.compare(password, user.password);
    if (!message) {
      console.log("wrong password, ", password);
      return null;
    }
    return user;
  }

  async sign(user: any) {
    const payload = { username: user.username, sub: user.userid };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

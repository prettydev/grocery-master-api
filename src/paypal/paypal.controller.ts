import { Controller, Post, Body, Param, Get } from "@nestjs/common";
import { PaypalService } from "./paypal.service";

@Controller("paypal")
export class PaypalController {
  constructor(private paypalService: PaypalService) {}

  @Post("/create")
  async create(
    @Body("currency") currency: string,
    @Body("amount") amount: number,
  ) {
    const result = await this.paypalService.create(currency, amount);

    return {
      result,
    };
  }

  @Post("/capture")
  async capture(@Body("order_id") order_id: number) {
    const result = await this.paypalService.capture(order_id);

    return {
      result,
    };

    return "Success";
  }
}

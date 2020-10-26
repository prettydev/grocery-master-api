import { Injectable } from "@nestjs/common";
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

const client = new checkoutNodeJssdk.core.PayPalHttpClient(
  new checkoutNodeJssdk.core.SandboxEnvironment(
    "", //paypal_client_id,
    "", //paypal_client_secret,
  ),
);

@Injectable()
export class PaypalService {
  constructor() {}

  async create(currency: string, amount: number): Promise<string> {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.headers["prefer"] = "return=representation";

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    });

    const response = await client.execute(request);

    console.log(`Response: ${JSON.stringify(response)}`);

    return "success";
  }

  async capture(order_id: number): Promise<string> {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(order_id);
    request.requestBody({});

    const response = await client.execute(request);

    console.log(`Response: ${JSON.stringify(response)}`);

    return "success";
  }
}

import * as dotenv from "dotenv";
dotenv.config();
const { DB_URI } = process.env;

import connection from "./db";
import { setInterval } from "timers/promises";
import { CustomerService } from "./service/Customer.service";

(async () => {
  const { customersCollection } = await connection(DB_URI);

  const INSERT_INTERVAL_MS = 200;
  const INSERT_MAX_AMOUNT = 10;

  for await (const tick of setInterval(INSERT_INTERVAL_MS)) {
    const usersAmount = Math.floor(Math.random() * INSERT_MAX_AMOUNT) + 1;
    await customersCollection.insertMany(
      new Array(usersAmount).fill(null).map(CustomerService.createCustomer),
      { ordered: true }
    );
    console.log("INSERTED: ", usersAmount);
  }
})();

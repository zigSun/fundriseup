import * as dotenv from "dotenv";
dotenv.config();

const { DB_URI } = process.env;

import connection from "./db";
import fs from "fs/promises";
import { Customer } from "./types";
import {
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  WithId,
} from "mongodb";

import { CustomerService } from "./service/Customer.service";
import CustomerQueue from "./service/Customer.queue";

async function main(args: Set<string>) {
  const { customersCollection, anonymCustomersCollection } = await connection(
    DB_URI
  );

  if (args.has("--full-reindex")) {
    const cursor = customersCollection.find({});
    while (await cursor.hasNext()) {
      const customer = await cursor.next();
      if (customer) {
        await anonymCustomersCollection.updateOne(
          { _id: customer._id },
          { $set: CustomerService.anonymizeCustomer(customer) },
          { upsert: true }
        );
      }
    }
    process.exit(0);
  } else {
    const COURSOR_PERSIST_FILE = "lastCursor.json";
    const CustomerQueueInstance = new CustomerQueue(anonymCustomersCollection);

    const lastCursor = await fs
      .access(COURSOR_PERSIST_FILE, fs.constants.F_OK)
      .then(() => fs.readFile(COURSOR_PERSIST_FILE, { encoding: "utf-8" }))
      .then((data) => JSON.parse(data))
      .catch(() => undefined);

    const watchCursor = customersCollection.watch<
      WithId<Customer>,
      | ChangeStreamInsertDocument<WithId<Customer>>
      | (ChangeStreamUpdateDocument<WithId<Customer>> & {
          fullDocument: WithId<Customer>;
        })
    >(
      [
        {
          $match: {
            $or: [{ operationType: "insert" }, { operationType: "update" }],
          },
        },
      ],
      {
        startAfter: lastCursor,
        fullDocument: "updateLookup",
      }
    );

    process.on("SIGINT", async () => {
      console.log("Gracefull exit");
      console.log("EXIT FLUSH");
      await CustomerQueueInstance.flush();
      await fs.writeFile(
        COURSOR_PERSIST_FILE,
        JSON.stringify(watchCursor.resumeToken),
        "utf-8"
      );
      process.exit(0);
    });

    while (await watchCursor.hasNext()) {
      const customer = await watchCursor.next();
      await CustomerQueueInstance.push(customer.fullDocument);
    }
  }
}

main(new Set(process.argv.slice(2))).catch((err) => {
  console.error(err);
  process.exit(0);
});

import { Collection } from "mongodb";
import { Customer } from "../types";

import { CustomerService } from "./Customer.service";

class UserQueue {
  private currentChunk: Customer[];

  private readonly collection: Collection<Customer>;
  private readonly CHUNK_LIMIT = 1000;
  private readonly FLUSH_TIMEOUT_MS = 1000;

  constructor(collection: Collection<Customer>) {
    this.collection = collection;
    this.currentChunk = [];

    setInterval(async () => {
      console.log("TIMEOUT FLUSH");
      await this.flush();
    }, this.FLUSH_TIMEOUT_MS);
  }

  async push(customer: Customer): Promise<void> {
    this.currentChunk.push(CustomerService.anonymizeCustomer(customer));
    if (this.currentChunk.length === this.CHUNK_LIMIT) {
      console.log("LIMIT FLUSH");
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.currentChunk.length) {
      console.log("FLUSH:", this.currentChunk.length);
      await this.collection.insertMany(this.currentChunk, { ordered: true });
      this.currentChunk = [];
    }
  }
}

export default UserQueue;

import { Collection, MongoClient } from "mongodb";
import { Customer } from "./types";

export default async (
  dbUrl: string
): Promise<{
  customersCollection: Collection<Customer>;
  anonymCustomersCollection: Collection<Customer>;
}> => {
  const connect = await MongoClient.connect(dbUrl);
  const db = connect.db();

  const customersCollection = db.collection<Customer>("customers");
  const anonymCustomersCollection = db.collection<Customer>(
    "customers_anonymised"
  );

  return {
    customersCollection,
    anonymCustomersCollection,
  };
};

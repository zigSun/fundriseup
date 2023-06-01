import { Customer } from "../types";

import { faker } from "@faker-js/faker";
import seedrandom from "seedrandom";

export class CustomerService {
  static createCustomer(): Customer {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      address: {
        line1: faker.location.streetAddress(),
        line2: faker.location.secondaryAddress(),
        postcode: faker.location.zipCode(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
      },
    };
  }

  static anonymizeCustomer(customer: Customer): Customer {
    function generateRandomSequence(seed: string, length: number): string {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const rng = seedrandom(seed);
      let seq = "";
      for (let i = 0; i < length; i++) {
        const symbIdx = Math.floor(rng() * chars.length);
        seq += chars.charAt(symbIdx);
      }

      return seq;
    }

    const RANDOM_SEQUENCE_LEN = 8;
    const [
      anonymizedFirstName,
      anonymizedLastName,
      anonymizedEmail,
      anonymizedAddressLine1,
      anonymizedAddressLine2,
      anonymizedPostcode,
    ] = generateRandomSequence(customer.email, 6 * RANDOM_SEQUENCE_LEN)
      .split(new RegExp(`(.{${RANDOM_SEQUENCE_LEN}})`))
      .filter(Boolean);

    return {
      firstName: anonymizedFirstName,
      lastName: anonymizedLastName,
      email: anonymizedEmail + customer.email.match(/@(.+)/)?.[0],
      address: {
        line1: anonymizedAddressLine1,
        line2: anonymizedAddressLine2,
        postcode: anonymizedPostcode,
        city: customer.address.city,
        state: customer.address.state,
        country: customer.address.country,
      },
    };
  }
}

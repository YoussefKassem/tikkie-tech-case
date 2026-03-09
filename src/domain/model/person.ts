import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Address, type AddressProps } from "./address";

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export const PersonPropsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().regex(PHONE_REGEX, "Invalid phone number format"),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
});

export interface CreatePersonProps {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: AddressProps;
}

/** Aggregate root representing a person. Immutable after creation. */
export class Person { 
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly address: Address;
  readonly createdAt: Date;

  private constructor(
    id: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    address: Address,
    createdAt: Date,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.address = address;
    this.createdAt = createdAt;
  }

  /**
   * Creates a new Person with a generated UUID and current timestamp.
   * Validates all input via Zod before construction.
   * @throws {ZodError} When input fails validation.
   */
  static create(props: CreatePersonProps): Person {
    const validated = PersonPropsSchema.parse(props);
    const address = new Address(validated.address);
    return new Person(
      randomUUID(),
      validated.firstName,
      validated.lastName,
      validated.phoneNumber,
      address,
      new Date(),
    );
  }

  /**
   * Rebuilds a Person from persisted data without validation or id generation.
   * Used by repository adapters when loading from storage.
   */
  static reconstitute(
    id: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    address: Address,
    createdAt: Date,
  ): Person {
    return new Person(id, firstName, lastName, phoneNumber, address, createdAt);
  }
}

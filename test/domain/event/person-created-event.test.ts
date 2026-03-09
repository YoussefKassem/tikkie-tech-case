import { describe, expect, it } from "vitest";
import { PersonCreatedEvent } from "../../../src/domain/event/person-created-event";
import { Person } from "../../../src/domain/model/person";

describe("PersonCreatedEvent", () => {
  it("should create an event from a person with the correct data", () => {
    // GIVEN a person
    const person = Person.create({
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+31612345678",
      address: {
        street: "Keizersgracht 123",
        city: "Amsterdam",
        postalCode: "1015 CJ",
        country: "NL",
      },
    });

    // WHEN creating an event from the person
    const event = PersonCreatedEvent.fromPerson(person);

    // THEN it should contain the person's id, name, and a timestamp
    expect(event.eventType).toBe("PersonCreated");
    expect(event.personId).toBe(person.id);
    expect(event.firstName).toBe("John");
    expect(event.lastName).toBe("Doe");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });
});

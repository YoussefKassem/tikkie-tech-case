import { beforeEach, describe, expect, it } from "vitest";
import {
  CreatePersonUseCase,
  type CreatePersonCommand,
} from "../../src/application/create-person";
import type { PersonCreatedEvent } from "../../src/domain/event/person-created-event";
import { InMemoryEventPublisher } from "../infrastructure/in-memory-event-publisher";
import { InMemoryPersonRepository } from "../infrastructure/in-memory-person-repository";

describe("CreatePersonUseCase", () => {
  let useCase: CreatePersonUseCase;
  let repository: InMemoryPersonRepository;
  let eventPublisher: InMemoryEventPublisher;

  const validCommand: CreatePersonCommand = {
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+31612345678",
    address: {
      street: "Keizersgracht 123",
      city: "Amsterdam",
      postalCode: "1015 CJ",
      country: "NL",
    },
  };

  beforeEach(() => {
    repository = new InMemoryPersonRepository();
    eventPublisher = new InMemoryEventPublisher();
    useCase = new CreatePersonUseCase(repository, eventPublisher);
  });

  it("should create a person with the provided data", async () => {
    // GIVEN a valid create-person command
    // WHEN executing the use case
    const person = await useCase.execute(validCommand);

    // THEN the returned person should have the correct data
    expect(person.id).toBeDefined();
    expect(person.firstName).toBe("John");
    expect(person.lastName).toBe("Doe");
    expect(person.phoneNumber).toBe("+31612345678");
  });

  it("should persist the person so it can be retrieved", async () => {
    // GIVEN a valid create-person command
    // WHEN executing the use case
    const person = await useCase.execute(validCommand);

    // THEN the person should be retrievable from the repository
    const retrieved = await repository.findById(person.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.firstName).toBe("John");
    expect(retrieved!.lastName).toBe("Doe");
  });

  it("should emit a PersonCreatedEvent with the person's data", async () => {
    // GIVEN a valid create-person command
    // WHEN executing the use case
    const person = await useCase.execute(validCommand);

    // THEN a single PersonCreatedEvent should be emitted with the correct data
    expect(eventPublisher.publishedEvents).toHaveLength(1);
    const event = eventPublisher.publishedEvents[0] as PersonCreatedEvent;
    expect(event.eventType).toBe("PersonCreated");
    expect(event.personId).toBe(person.id);
    expect(event.firstName).toBe("John");
    expect(event.lastName).toBe("Doe");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("should reject invalid input without persisting or publishing", async () => {
    // GIVEN an invalid command with an empty first name
    const invalidCommand = { ...validCommand, firstName: "" };

    // WHEN executing the use case
    // THEN it should throw a validation error
    await expect(useCase.execute(invalidCommand)).rejects.toThrow();

    // AND nothing should be persisted or published
    expect(eventPublisher.publishedEvents).toHaveLength(0);
  });
});

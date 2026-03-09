import type { EventPublisher } from "../domain/event/event-publisher";
import { PersonCreatedEvent } from "../domain/event/person-created-event";
import type { CreatePersonProps } from "../domain/model/person";
import { Person } from "../domain/model/person";
import type { PersonRepository } from "../domain/repository/person-repository";

/** Raw input DTO for creating a person. */
export interface CreatePersonCommand {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/** Use case that creates a person, persists it, and publishes a domain event. */
export class CreatePersonUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  /**
   * Executes the create-person flow: validate, persist, publish event.
   * @returns The created {@link Person}.
   * @throws {ZodError} When the command fails domain validation.
   */
  async execute(command: CreatePersonCommand): Promise<Person> {
    const person = Person.create(command satisfies CreatePersonProps);

    await this.personRepository.save(person);

    const event = PersonCreatedEvent.fromPerson(person);
    await this.eventPublisher.publish(event);

    return person;
  }
}

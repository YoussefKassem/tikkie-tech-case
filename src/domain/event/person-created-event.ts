import type { Person } from "../model/person";
import type { DomainEvent } from "./domain-event";

/** Domain event emitted when a new person is created. */
export class PersonCreatedEvent implements DomainEvent {
	readonly eventType = "PersonCreated";
	readonly personId: string;
	readonly firstName: string;
	readonly lastName: string;
	readonly occurredAt: Date;

	private constructor(
		personId: string,
		firstName: string,
		lastName: string,
		occurredAt: Date,
	) {
		this.personId = personId;
		this.firstName = firstName;
		this.lastName = lastName;
		this.occurredAt = occurredAt;
	}

	/** Creates a {@link PersonCreatedEvent} from a {@link Person} aggregate. */
	static fromPerson(person: Person): PersonCreatedEvent {
		return new PersonCreatedEvent(
			person.id,
			person.firstName,
			person.lastName,
			new Date(),
		);
	}
}

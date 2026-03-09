import type { Person } from "../../src/domain/model/person";
import type { PersonRepository } from "../../src/domain/repository/person-repository";

/** In-memory fake of {@link PersonRepository} for testing. Stores persons in a Map. */
export class InMemoryPersonRepository implements PersonRepository {
	private readonly store = new Map<string, Person>();

	async save(person: Person): Promise<void> {
		this.store.set(person.id, person);
	}

	async findById(id: string): Promise<Person | null> {
		return this.store.get(id) ?? null;
	}
}

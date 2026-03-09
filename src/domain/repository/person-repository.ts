import type { Person } from "../model/person";

/** Port for persisting and retrieving {@link Person} aggregates. */
export interface PersonRepository {
	/** Persists a person. Overwrites if the id already exists. */
	save(person: Person): Promise<void>;
	/** Returns a person by id, or `null` if not found. */
	findById(id: string): Promise<Person | null>;
}

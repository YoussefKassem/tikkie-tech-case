import type { DomainEvent } from "./domain-event";

/** Port for publishing domain events to an external bus. */
export interface EventPublisher {
	/** Publishes a single domain event. */
	publish(event: DomainEvent): Promise<void>;
}

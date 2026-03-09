/** Base interface for all domain events in the system. */
export interface DomainEvent {
	/** Discriminator identifying the event type (e.g. "PersonCreated"). */
	readonly eventType: string;
	/** Timestamp when the event occurred. */
	readonly occurredAt: Date;
}

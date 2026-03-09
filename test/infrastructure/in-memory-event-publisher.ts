import type { DomainEvent } from "../../src/domain/event/domain-event";
import type { EventPublisher } from "../../src/domain/event/event-publisher";

/** In-memory fake of {@link EventPublisher} for testing. Captures published events in an array. */
export class InMemoryEventPublisher implements EventPublisher {
  readonly publishedEvents: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event);
  }
}

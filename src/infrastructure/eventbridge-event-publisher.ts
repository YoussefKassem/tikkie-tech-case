import {
  type EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import type { DomainEvent } from "../domain/event/domain-event";
import type { EventPublisher } from "../domain/event/event-publisher";

/** EventBridge implementation of {@link EventPublisher}. Publishes to a custom event bus with source `person-service`. */
export class EventBridgeEventPublisher implements EventPublisher {
  constructor(
    private readonly client: EventBridgeClient,
    private readonly eventBusName: string,
  ) {}

  /** Publishes a domain event to EventBridge. Uses {@link DomainEvent.eventType} as the DetailType. */
  async publish(event: DomainEvent): Promise<void> {
    await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: "person-service",
            DetailType: event.eventType,
            Detail: JSON.stringify(event),
            EventBusName: this.eventBusName,
          },
        ],
      }),
    );
  }
}

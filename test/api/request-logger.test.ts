import { afterEach, describe, expect, it, vi } from "vitest";
import { RequestLogger } from "../../src/api/request-logger";

describe("RequestLogger", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("emits the structured event to an injected sink", () => {
    // GIVEN a logger with an injected sink and fake time enabled
    vi.useFakeTimers();

    const emitted: Array<Record<string, unknown>> = [];
    const logger = new RequestLogger("req-123", "create-person", {
      sink: (event) => emitted.push(event),
    });

    // WHEN time advances and the logger emits a success event
    vi.advanceTimersByTime(25);
    logger.emit({ status: 201, personId: "person-1" });

    // THEN the sink should receive the full structured event with duration
    expect(emitted).toEqual([
      {
        requestId: "req-123",
        handler: "create-person",
        status: 201,
        durationMs: 25,
        personId: "person-1",
      },
    ]);
  });

  it("includes shared metadata in every emitted event", () => {
    // GIVEN a logger configured with shared context metadata
    const emitted: Array<Record<string, unknown>> = [];
    const logger = new RequestLogger("req-456", "create-person", {
      sink: (event) => emitted.push(event),
      context: {
        environment: "test",
      },
    });

    // WHEN the logger emits a client error event
    logger.emit({ status: 400 });

    // THEN the emitted event should include the shared metadata
    expect(emitted).toEqual([
      {
        requestId: "req-456",
        handler: "create-person",
        status: 400,
        durationMs: 0,
        environment: "test",
      },
    ]);
  });
});

interface RequestLogError {
	type: string;
	message: string;
}

interface BaseWideEvent {
	requestId: string;
	handler: string;
	status: number;
	durationMs: number;
	error?: RequestLogError;
}

interface RequestLoggerOptions {
	context?: Record<string, unknown>;
	sink?: (event: Record<string, unknown>) => void;
}

/**
 * Emits a single structured wide event per request.
 * Callers can attach extra fields per emitted event while sharing the common event structure.
 *
 * @example
 * const logger = new RequestLogger(requestId, "create-person");
 * logger.emit({ status: 201, personId: person.id });
 */
export class RequestLogger {
	private readonly startedAt = Date.now();
	private readonly context: Record<string, unknown>;
	private readonly sink: (event: Record<string, unknown>) => void;

	constructor(
		private readonly requestId: string,
		private readonly handlerName: string,
		options?: RequestLoggerOptions,
	) {
		this.context = options?.context ?? {};
		this.sink =
			options?.sink ?? ((event) => console.log(JSON.stringify(event)));
	}

	emit<TExtra extends Record<string, unknown>>(
		payload: { status: number; error?: RequestLogError } & TExtra,
	): void {
		const event: BaseWideEvent & Record<string, unknown> & TExtra = {
			...this.context,
			...payload,
			requestId: this.requestId,
			handler: this.handlerName,
			durationMs: Date.now() - this.startedAt,
		};

		this.sink(event);
	}
}

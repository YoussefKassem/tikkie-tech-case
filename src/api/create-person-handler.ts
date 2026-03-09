import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type { CreatePersonHandlerDependencies } from "./create-person-handler.dependencies";
import { buildCreatePersonHandlerDependencies } from "./create-person-handler.dependencies";
import { RequestLogger } from "./request-logger";

/**
 * Factory that creates a `POST /person` handler with pre-wired dependencies.
 * @returns 201 with the created person, 400 on invalid JSON or validation errors, 500 on unexpected failures.
 */
export const createHandler =
	({ useCase }: CreatePersonHandlerDependencies) =>
	async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
		const logger = new RequestLogger(
			event.requestContext.requestId,
			"create-person",
		);

		try {
			const body = JSON.parse(event.body ?? "{}");
			const person = await useCase.execute(body);

			logger.emit({ status: 201, personId: person.id });

			return {
				statusCode: 201,
				body: JSON.stringify({
					id: person.id,
					firstName: person.firstName,
					lastName: person.lastName,
					phoneNumber: person.phoneNumber,
					address: {
						street: person.address.street,
						city: person.address.city,
						postalCode: person.address.postalCode,
						country: person.address.country,
					},
					createdAt: person.createdAt.toISOString(),
				}),
			};
		} catch (error) {
			if (error instanceof SyntaxError) {
				logger.emit({
					status: 400,
					error: { type: "SyntaxError", message: error.message },
				});
				return {
					statusCode: 400,
					body: JSON.stringify({ message: "Invalid JSON body" }),
				};
			}

			if (error instanceof Error && error.name === "ZodError") {
				logger.emit({
					status: 400,
					error: { type: "ZodError", message: error.message },
				});
				return {
					statusCode: 400,
					body: JSON.stringify({ message: error.message }),
				};
			}

			logger.emit({
				status: 500,
				error: {
					type:
						error instanceof Error ? error.constructor.name : "UnknownError",
					message: error instanceof Error ? error.message : String(error),
				},
			});

			return {
				statusCode: 500,
				body: JSON.stringify({ message: "Internal server error" }),
			};
		}
	};

/** Cached handler instance, initialized on first invocation and reused across warm starts. */
let handlerDelegate:
	| ((event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>)
	| undefined;

/** Lambda entry point. Lazily builds dependencies on cold start, then delegates to {@link createHandler}. */
export const handler = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	if (!handlerDelegate) {
		const dependencies = buildCreatePersonHandlerDependencies();
		handlerDelegate = createHandler(dependencies);
	}

	return handlerDelegate(event);
};

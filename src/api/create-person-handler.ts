import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type { CreatePersonHandlerDependencies } from "./create-person-handler.dependencies";
import { buildCreatePersonHandlerDependencies } from "./create-person-handler.dependencies";
import { RequestLogger } from "./request-logger";

/**
 * Lambda handler for `POST /person`.
 * Parses the JSON body, delegates to {@link CreatePersonUseCase}, and returns the created person.
 * Emits a single wide structured event per request for observability.
 * @returns 201 on success, 400 on validation/parse errors, 500 on unexpected errors.
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

let handlerDelegate:
	| ((event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>)
	| undefined;

export const handler = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	handlerDelegate ??= createHandler(buildCreatePersonHandlerDependencies());
	return handlerDelegate(event);
};

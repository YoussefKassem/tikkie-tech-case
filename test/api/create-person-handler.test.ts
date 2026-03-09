import type { APIGatewayProxyEvent } from "aws-lambda";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHandler } from "../../src/api/create-person-handler";
import {
	type CreatePersonHandlerUseCase,
	buildCreatePersonHandlerDependencies,
} from "../../src/api/create-person-handler.dependencies";
import type { Person } from "../../src/domain/model/person";

const buildEvent = (body: string | null): APIGatewayProxyEvent =>
	({
		body,
		requestContext: {
			requestId: "request-123",
		},
	}) as APIGatewayProxyEvent;

describe("createHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns 201 with the created person payload", async () => {
		// GIVEN a handler with a use case that creates a person
		vi.spyOn(console, "log").mockImplementation(() => {});
		const person = {
			id: "person-1",
			firstName: "John",
			lastName: "Doe",
			phoneNumber: "+31612345678",
			address: {
				street: "Keizersgracht 123",
				city: "Amsterdam",
				postalCode: "1015 CJ",
				country: "NL",
			},
			createdAt: new Date("2024-01-01T10:00:00.000Z"),
		} as Person;
		const useCase: CreatePersonHandlerUseCase = {
			execute: vi.fn().mockResolvedValue(person),
		};
		const handler = createHandler({ useCase });

		// WHEN the handler receives a valid request
		const response = await handler(
			buildEvent(
				JSON.stringify({
					firstName: "John",
					lastName: "Doe",
					phoneNumber: "+31612345678",
					address: {
						street: "Keizersgracht 123",
						city: "Amsterdam",
						postalCode: "1015 CJ",
						country: "NL",
					},
				}),
			),
		);

		// THEN it should return the created person as a 201 response
		expect(response.statusCode).toBe(201);
		expect(JSON.parse(response.body)).toEqual({
			id: "person-1",
			firstName: "John",
			lastName: "Doe",
			phoneNumber: "+31612345678",
			address: {
				street: "Keizersgracht 123",
				city: "Amsterdam",
				postalCode: "1015 CJ",
				country: "NL",
			},
			createdAt: "2024-01-01T10:00:00.000Z",
		});
	});

	it("returns 400 when the request body is invalid JSON", async () => {
		// GIVEN a handler with a valid use case dependency
		vi.spyOn(console, "log").mockImplementation(() => {});
		const useCase: CreatePersonHandlerUseCase = {
			execute: vi.fn(),
		};
		const handler = createHandler({ useCase });

		// WHEN the handler receives malformed JSON
		const response = await handler(buildEvent("{"));

		// THEN it should reject the request as a bad request
		expect(response.statusCode).toBe(400);
		expect(JSON.parse(response.body)).toEqual({ message: "Invalid JSON body" });
		expect(useCase.execute).not.toHaveBeenCalled();
	});

	it("returns 400 when the use case reports a validation error", async () => {
		// GIVEN a handler with a use case that fails validation
		vi.spyOn(console, "log").mockImplementation(() => {});
		const validationError = new Error("First name is required");
		validationError.name = "ZodError";
		const useCase: CreatePersonHandlerUseCase = {
			execute: vi.fn().mockRejectedValue(validationError),
		};
		const handler = createHandler({ useCase });

		// WHEN the handler receives a syntactically valid request
		const response = await handler(buildEvent("{}"));

		// THEN it should return the validation message as a bad request
		expect(response.statusCode).toBe(400);
		expect(JSON.parse(response.body)).toEqual({
			message: "First name is required",
		});
	});

	it("returns 500 when the use case fails unexpectedly", async () => {
		// GIVEN a handler with a use case that throws an unexpected error
		vi.spyOn(console, "log").mockImplementation(() => {});
		const useCase: CreatePersonHandlerUseCase = {
			execute: vi.fn().mockRejectedValue(new Error("EventBridge unavailable")),
		};
		const handler = createHandler({ useCase });

		// WHEN the handler receives a valid request
		const response = await handler(buildEvent("{}"));

		// THEN it should return a generic internal server error
		expect(response.statusCode).toBe(500);
		expect(JSON.parse(response.body)).toEqual({
			message: "Internal server error",
		});
	});
});

describe("buildCreatePersonHandlerDependencies", () => {
	it("throws when required environment variables are missing", () => {
		// GIVEN an environment without the required AWS resource names
		const environment = {};

		// WHEN building the handler dependencies
		// THEN it should fail fast with a clear configuration error
		expect(() => buildCreatePersonHandlerDependencies(environment)).toThrow(
			"Missing required environment variables: TABLE_NAME, EVENT_BUS_NAME",
		);
	});
});

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
	type CreatePersonCommand,
	CreatePersonUseCase,
} from "../application/create-person";
import type { Person } from "../domain/model/person";
import { DynamoPersonRepository } from "../infrastructure/dynamo-person-repository";
import { EventBridgeEventPublisher } from "../infrastructure/eventbridge-event-publisher";

export interface CreatePersonHandlerUseCase {
	execute(command: CreatePersonCommand): Promise<Person>;
}

export interface CreatePersonHandlerDependencies {
	useCase: CreatePersonHandlerUseCase;
}

export const buildCreatePersonHandlerDependencies = (
	environment: NodeJS.ProcessEnv = process.env,
): CreatePersonHandlerDependencies => {
	const tableName = environment.TABLE_NAME;
	const eventBusName = environment.EVENT_BUS_NAME;

	if (!tableName || !eventBusName) {
		throw new Error(
			"Missing required environment variables: TABLE_NAME, EVENT_BUS_NAME",
		);
	}

	const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
	const eventBridgeClient = new EventBridgeClient({});

	const repository = new DynamoPersonRepository(dynamoClient, tableName);
	const eventPublisher = new EventBridgeEventPublisher(
		eventBridgeClient,
		eventBusName,
	);

	return {
		useCase: new CreatePersonUseCase(repository, eventPublisher),
	};
};

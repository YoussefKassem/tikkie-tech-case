import {
  type DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { Address } from "../domain/model/address";
import { Person } from "../domain/model/person";
import type { PersonRepository } from "../domain/repository/person-repository";

/** DynamoDB implementation of {@link PersonRepository}. Uses single-table design with `PK: PERSON#<id>`. */
export class DynamoPersonRepository implements PersonRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  /** Persists a person as a DynamoDB item. */
  async save(person: Person): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `PERSON#${person.id}`,
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
        },
      }),
    );
  }

  /** Retrieves a person by id. Returns `null` if not found. */
  async findById(id: string): Promise<Person | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `PERSON#${id}` },
      }),
    );

    if (!result.Item) {
      return null;
    }

    const item = result.Item;
    const address = new Address({
      street: item.address.street,
      city: item.address.city,
      postalCode: item.address.postalCode,
      country: item.address.country,
    });

    return Person.reconstitute(
      item.id,
      item.firstName,
      item.lastName,
      item.phoneNumber,
      address,
      new Date(item.createdAt),
    );
  }
}

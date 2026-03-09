import { describe, expect, it } from "vitest";
import { Person } from "../../../src/domain/model/person";

describe("Person", () => {
	const validProps = {
		firstName: "John",
		lastName: "Doe",
		phoneNumber: "+31612345678",
		address: {
			street: "Keizersgracht 123",
			city: "Amsterdam",
			postalCode: "1015 CJ",
			country: "NL",
		},
	};

	it("should create a person with valid properties", () => {
		// GIVEN valid person properties
		// WHEN creating a person
		const person = Person.create(validProps);

		// THEN all fields should be set correctly
		expect(person.id).toBeDefined();
		expect(person.firstName).toBe("John");
		expect(person.lastName).toBe("Doe");
		expect(person.phoneNumber).toBe("+31612345678");
		expect(person.address.street).toBe("Keizersgracht 123");
		expect(person.address.city).toBe("Amsterdam");
		expect(person.createdAt).toBeInstanceOf(Date);
	});

	it("should generate a unique UUID for each person", () => {
		// GIVEN valid person properties
		// WHEN creating two persons
		const person1 = Person.create(validProps);
		const person2 = Person.create(validProps);

		// THEN each should have a unique UUID v4 id
		expect(person1.id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
		expect(person1.id).not.toBe(person2.id);
	});

	it("should throw when firstName is empty", () => {
		// GIVEN a person with an empty first name
		const props = { ...validProps, firstName: "" };

		// WHEN creating the person
		// THEN it should throw a validation error
		expect(() => Person.create(props)).toThrow();
	});

	it("should throw when lastName is empty", () => {
		// GIVEN a person with an empty last name
		const props = { ...validProps, lastName: "" };

		// WHEN creating the person
		// THEN it should throw a validation error
		expect(() => Person.create(props)).toThrow();
	});

	it("should throw when phoneNumber has invalid format", () => {
		// GIVEN a person with an invalid phone number
		const props = { ...validProps, phoneNumber: "not-a-phone" };

		// WHEN creating the person
		// THEN it should throw with "Invalid phone number"
		expect(() => Person.create(props)).toThrow("Invalid phone number");
	});

	it("should throw when address is invalid", () => {
		// GIVEN a person with an invalid address
		const props = {
			...validProps,
			address: { ...validProps.address, street: "" },
		};

		// WHEN creating the person
		// THEN it should throw a validation error
		expect(() => Person.create(props)).toThrow();
	});
});

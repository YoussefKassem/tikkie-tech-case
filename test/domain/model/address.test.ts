import { describe, expect, it } from "vitest";
import { Address } from "../../../src/domain/model/address";

describe("Address", () => {
	const validProps = {
		street: "Keizersgracht 123",
		city: "Amsterdam",
		postalCode: "1015 CJ",
		country: "NL",
	};

	it("should create an address with valid properties", () => {
		// GIVEN valid address properties
		// WHEN creating an address
		const address = new Address(validProps);

		// THEN all fields should be set correctly
		expect(address.street).toBe("Keizersgracht 123");
		expect(address.city).toBe("Amsterdam");
		expect(address.postalCode).toBe("1015 CJ");
		expect(address.country).toBe("NL");
	});

	it("should throw when street is empty", () => {
		// GIVEN an address with an empty street
		const props = { ...validProps, street: "" };

		// WHEN creating the address
		// THEN it should throw a validation error
		expect(() => new Address(props)).toThrow();
	});

	it("should throw when city is empty", () => {
		// GIVEN an address with an empty city
		const props = { ...validProps, city: "" };

		// WHEN creating the address
		// THEN it should throw a validation error
		expect(() => new Address(props)).toThrow();
	});

	it("should throw when postalCode is empty", () => {
		// GIVEN an address with an empty postal code
		const props = { ...validProps, postalCode: "" };

		// WHEN creating the address
		// THEN it should throw a validation error
		expect(() => new Address(props)).toThrow();
	});

	it("should throw when country is empty", () => {
		// GIVEN an address with an empty country
		const props = { ...validProps, country: "" };

		// WHEN creating the address
		// THEN it should throw a validation error
		expect(() => new Address(props)).toThrow();
	});
});

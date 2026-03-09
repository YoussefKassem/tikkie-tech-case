import { z } from "zod";

export const AddressSchema = z.object({
	street: z.string().min(1, "Street is required"),
	city: z.string().min(1, "City is required"),
	postalCode: z.string().min(1, "Postal code is required"),
	country: z.string().min(1, "Country is required"),
});

export type AddressProps = z.infer<typeof AddressSchema>;

/** Immutable value object representing a physical address. Self-validates on construction via Zod schema. */
export class Address {
	readonly street: string;
	readonly city: string;
	readonly postalCode: string;
	readonly country: string;

	/** @throws {ZodError} When any field is empty. */
	constructor(props: AddressProps) {
		const result = AddressSchema.parse(props);
		this.street = result.street;
		this.city = result.city;
		this.postalCode = result.postalCode;
		this.country = result.country;
	}
}

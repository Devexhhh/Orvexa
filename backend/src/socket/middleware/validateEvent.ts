import { ZodSchema } from "zod";

export function validateSocketEvent<T>(
    schema: ZodSchema<T>,
    data: unknown,
) {
    return schema.safeParse(data);
}

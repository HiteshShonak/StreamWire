import { z } from "zod";

/**
 * Generic Zod validation middleware
 * Validates req.body against the provided schema
 */
export const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Validate and parse the request body
            const validatedData = schema.parse(req.body);

            // Replace req.body with validated/parsed data
            req.body = validatedData;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Format Zod errors into user-friendly messages
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Validation failed",
                    errors
                });
            }

            // Pass other errors to the global error handler
            next(error);
        }
    };
};

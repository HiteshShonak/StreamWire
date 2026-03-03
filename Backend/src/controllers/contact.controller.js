import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendContactFormEmail } from "../utils/mail.js";

// Submit contact form

export const sendContactMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
        throw new ApiError(400, "All fields are required");
    }

    if (name.trim().length < 2) {
        throw new ApiError(400, "Name must be at least 2 characters");
    }

    if (subject.trim().length < 5) {
        throw new ApiError(400, "Subject must be at least 5 characters");
    }

    if (message.trim().length < 20) {
        throw new ApiError(400, "Message must be at least 20 characters");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    try {
        // Send email
        await sendContactFormEmail({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            subject: subject.trim(),
            message: message.trim()
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Message sent successfully! We'll get back to you soon."
            )
        );
    } catch (emailError) {
        console.error("Failed to send contact email:", emailError);
        throw new ApiError(500, "Failed to send message. Please try again later or contact us directly at support@streamwire.com");
    }
});

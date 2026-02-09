import { Router } from "express";
import { sendContactMessage } from "../controllers/contact.controller.js";
import { contactLimiter } from "../middlewares/rate-limiters/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { contactFormSchema } from "../validations/index.js";

const router = Router();

// Public route - no authentication required (with rate limiting)
router.route("/send").post(contactLimiter, validate(contactFormSchema), sendContactMessage);

export default router;

import nodemailer from "nodemailer";

export const sendEmail = async (email, otp, type = "VERIFY") => {
    // 5s timeout so SMTP fails fast if blocked
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        connectionTimeout: 5000,
        socketTimeout: 5000,
    });

    const emailOptions = {
        VERIFY: {
            subject: "Verify your StreamWire Account",
            title: "Welcome to StreamWire!",
            message: "Use the 6-digit code below to complete your registration."
        },
        VERIFICATION_SUCCESS: {
            subject: "Welcome to StreamWire! Account Verified",
            title: "Verification Successful!",
            message: "Congratulations! Your account has been verified. You can now log in, update your profile, and start streaming content."
        },
        RESET: {
            subject: "Reset your Password",
            title: "Password Reset Request",
            message: "Use this code to reset your password. If you didn't request this, ignore this email."
        },
        PASSWORD_RESET_SUCCESS: {
            subject: "Security Alert: Password Changed Successfully",
            title: "Password Updated",
            message: "The password for your StreamWire account has been changed successfully. <br/><br/><b>If you did not perform this action, please contact support immediately.</b>"
        }
    };

    const currentOptions = emailOptions[type] || emailOptions.VERIFY;

    // Only render the OTP box if 'otp' is provided
    const otpSection = otp
        ? `
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">This code will expire in 10 minutes.</p>
          `
        : `
            <div style="margin: 24px 0; border-top: 1px solid #f1f5f9;"></div>
          `;

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px;">StreamWire</h1>
            </div>
            <h3 style="color: #1e293b; text-align: center; margin-top: 0;">${currentOptions.title}</h3>
            <p style="color: #475569; text-align: center; line-height: 1.5;">${currentOptions.message}</p>
            ${otpSection}
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;">
            <p style="font-size: 11px; color: #cbd5e1; text-align: center;">
                This is an automated message from StreamWire. Please do not reply to this email.
            </p>
        </div>
    `;

    return await transporter.sendMail({
        from: `"StreamWire Support" <${process.env.MAIL_USER}>`,
        to: email,
        subject: currentOptions.subject,
        html: htmlContent,
    });
};

// Send Contact Form Email to Support
export const sendContactFormEmail = async (formData) => {
    const { name, email, subject, message } = formData;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        connectionTimeout: 5000,
        socketTimeout: 5000,
    });

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #f8fafc;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">StreamWire</h1>
                <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">New Contact Form Submission</p>
            </div>

            <!-- Content -->
            <div style="background: #ffffff; padding: 32px 24px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                <!-- Sender Info -->
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #2563eb;">
                    <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px;">Contact Information</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 80px;">Name:</td>
                            <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email:</td>
                            <td style="padding: 6px 0; color: #1e293b; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                        </tr>
                    </table>
                </div>

                <!-- Subject -->
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Subject</h4>
                    <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;">${subject}</p>
                </div>

                <!-- Message -->
                <div>
                    <h4 style="color: #64748b; margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Message</h4>
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${message}</p>
                    </div>
                </div>

                <!-- Quick Reply Button -->
                <div style="margin-top: 24px; text-align: center;">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                       style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        Reply to ${name}
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                    This message was sent via the StreamWire contact form.<br/>
                    Received on ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
            </div>
        </div>
    `;

    // Send to support email
    await transporter.sendMail({
        from: `"StreamWire Contact Form" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_USER, // Send to your own email
        replyTo: email, // User's email for easy reply
        subject: `[Contact Form] ${subject}`,
        html: htmlContent,
    });

    // Send confirmation to user
    const confirmationHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px;">StreamWire</h1>
            </div>
            <h3 style="color: #1e293b; text-align: center; margin-top: 0;">Message Received!</h3>
            <p style="color: #475569; text-align: center; line-height: 1.5;">
                Thank you for contacting StreamWire, <strong>${name}</strong>!<br/><br/>
                We've received your message and will get back to you as soon as possible, typically within 24 hours.
            </p>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600;">Your Subject:</p>
                <p style="color: #1e293b; margin: 0; font-weight: 600;">${subject}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;">
            <p style="font-size: 11px; color: #cbd5e1; text-align: center;">
                This is an automated confirmation from StreamWire.<br/>
                Please do not reply to this email.
            </p>
        </div>
    `;

    await transporter.sendMail({
        from: `"StreamWire Support" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "We've received your message - StreamWire Support",
        html: confirmationHtml,
    });
};
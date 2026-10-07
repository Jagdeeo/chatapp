import { Resend } from "resend";

import env from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);


export const sendOTPEmail = async (email, fullname, otp) => {
  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,

    to: [email],

    subject: "Your ChatApp verification code",

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Email Verification</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #f4f4f5;
            font-family: Arial, sans-serif;
          "
        >
          <div
            style="
              max-width: 500px;
              margin: 40px auto;
              background: white;
              padding: 30px;
              border-radius: 12px;
            "
          >

            <h2 style="margin-bottom: 10px;">
              Welcome to ChatApp 👋
            </h2>

            <p>
              Hello ${fullname},
            </p>

            <p>
              Use the following OTP to verify your email address:
            </p>

            <div
              style="
                margin: 25px 0;
                padding: 15px;
                background: #f1f5f9;
                border-radius: 8px;
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
              "
            >
              ${otp}
            </div>

            <p>
              This OTP will expire in <strong>5 minutes</strong>.
            </p>

            <p>
              If you did not create a ChatApp account, you can ignore
              this email.
            </p>

            <hr />

            <p
              style="
                color: #777;
                font-size: 12px;
              "
            >
              This is an automated email. Please do not reply.
            </p>

          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send verification email");
  }

  return data;
};
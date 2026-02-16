export const sendOTPTemplate = (userName, otp, verifyUrl) => {
  return `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif;">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Verify your account</title>
  </head>
  <body style="background:#f4f6fb; margin:0; padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:30px 10px;">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 20px rgba(21,30,60,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#0d6efd; padding:22px 30px; text-align:center; color:#ffffff;">
                <h1 style="margin:0; font-size:20px; font-weight:700;">Verify your email</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px 30px; color:#374151;">
                <p style="margin:0 0 14px; font-size:16px;">Hi ${userName ?? "there"},</p>

                <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:#4b5563;">
                  Thank you for creating an account with <strong>RescueNet</strong>.
                  To complete your registration, please use the verification code below. This code will expire in <strong> 3 minutes</strong>.
                </p>

                <!-- OTP box -->
                <div style="text-align:center; margin:22px 0;">
                  <div style="display:inline-block; background:#f1f5f9; padding:18px 26px; border-radius:8px; box-shadow:0 1px 0 rgba(0,0,0,0.02);">
                    <p style="margin:0; font-size:28px; letter-spacing:4px; font-weight:700; color:#0b2d6b;">${otp}</p>
                  </div>
                </div>

                <p style="margin:0 0 18px; font-size:15px; color:#4b5563;">
                  Or click the button below to verify automatically:
                </p>

                <div style="text-align:center; margin:18px 0;">
                  <a href="${verifyUrl ?? "#"}" target="_blank" rel="noopener" style="display:inline-block; text-decoration:none; background:#0d6efd; color:#ffffff; padding:12px 22px; border-radius:8px; font-weight:600;">
                    Verify Account
                  </a>
                </div>

                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="word-break:break-all; font-size:12px; color:#6b7280; margin:6px 0 0;">${verifyUrl ?? "—"}</p>

                <hr style="border:none; border-top:1px solid #eef2f7; margin:24px 0;" />

                <p style="font-size:13px; color:#6b7280; margin:0;">
                  If you didn't request this, you can safely ignore this email. For help, contact our support at <a href="mailto:support@rescuenet.com" style="color:#0d6efd; text-decoration:none;">support@rescuenet.com</a>.
                </p>

                <p style="margin:16px 0 0; font-size:13px; color:#9ca3af;">
                  — The RescueNet Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc; padding:14px 24px; text-align:center; color:#9ca3af; font-size:12px;">
                © ${new Date().getFullYear()} RescueNet. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

export const verifyAccountTemplate = (userName) => {

    return `
   <!DOCTYPE html>
<html lang="en" style="margin:0; padding:0; font-family:Arial, sans-serif;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body style="background:#f4f4f8; padding:0; margin:0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="background:white; margin-top:40px; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1)"
          >
            <!-- Header -->
            <tr>
              <td
                style="background:#4e73df; padding:20px 30px; color:white; text-align:center;"
              >
                <h1 style="margin:0; font-size:24px; font-weight:600;">
                  Welcome to RescueNet!
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <h2 style="margin:0 0 15px; color:#333;">Hello ${userName ?? "there"}, 👋</h2>

                <p style="font-size:16px; color:#555; line-height:1.6;">
                  We're excited to let you know that your account has been
                  successfully created on <strong>RescueNet</strong>.
                </p>

                <p style="font-size:16px; color:#555; line-height:1.6;">
                  You can now log in and access all features including shelter discovery, real-time disaster alerts, SOS requests, and volunteer coordination.
                </p>

                <div style="text-align:center; margin:30px 0;">
                  <a
                    href="google.com"
                    style="
                      background:#4e73df;
                      color:white;
                      text-decoration:none;
                      padding:12px 25px;
                      border-radius:6px;
                      font-size:16px;
                      display:inline-block;
                    "
                    >Login to Your Account</a
                  >
                </div>

                <p style="font-size:15px; color:#777;">
                  If you didn’t create this account, please contact our support
                  team immediately. <a href="mailto:support@rescunet.com" style="color:#0d6efd; text-decoration:none;">support@rescunet.com</a>.
                </p>

                <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />

                <p style="font-size:14px; color:#888;">
                  Thank you for choosing <strong>RescueNet</strong>.<br />
                  We’re glad to have you with us!
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="background:#f1f1f5; padding:15px; text-align:center; font-size:13px; color:#777;"
              >
                © ${new Date().getFullYear()} RescueNet. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

};

export const sendResetOTPTemplate = (userName, passOtp, resetUrl) => {
    return `<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif;">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Password Reset</title>
  </head>
  <body style="background:#f4f6fb; margin:0; padding:20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(20,30,60,0.06);">
            <!-- Header -->
            <tr>
              <td style="background:#1f6feb; padding:20px 26px; color:#ffffff; text-align:center;">
                <h1 style="margin:0; font-size:20px; font-weight:700;">Password Reset Request</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px 30px; color:#333;">
                <p style="margin:0 0 12px; font-size:16px;">Hi ${userName ?? "there"},</p>

                <p style="margin:0 0 18px; color:#555; font-size:15px; line-height:1.6;">
                  We received a request to reset the password for your account. Use the one-time verification code below to proceed. This code will expire in <strong> 3 minutes</strong>.
                </p>

                <!-- OTP box -->
                <div style="text-align:center; margin:20px 0;">
                  <div style="display:inline-block; background:#f1f5f9; padding:18px 28px; border-radius:8px; box-shadow:0 1px 0 rgba(0,0,0,0.02);">
                    <p style="margin:0; font-size:28px; letter-spacing:6px; font-weight:700; color:#0b2d6b;">${passOtp}</p>
                  </div>
                </div>

                <p style="margin:0 0 12px; font-size:15px; color:#555;">
                  Or click the button below to open the secure reset page:
                </p>

                <div style="text-align:center; margin:16px 0;">
                  <a href="${resetUrl ?? "#"}" target="_blank" rel="noopener" style="display:inline-block; text-decoration:none; background:#1f6feb; color:#ffffff; padding:12px 22px; border-radius:8px; font-weight:600;">
                    Reset Password
                  </a>
                </div>

                <p style="margin:0 0 10px; font-size:13px; color:#6b7280;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="word-break:break-all; font-size:12px; color:#6b7280; margin:6px 0 0;">${resetUrl ?? "—"}</p>

                <hr style="border:none; border-top:1px solid #eef2f7; margin:20px 0;" />

                <p style="font-size:13px; color:#6b7280; margin:0;">
                  If you did not request a password reset, please ignore this email or contact our support at <a href="mailto:support@rescuenet.com" style="color:#1f6feb; text-decoration:none;">support@rescuenet.com</a>.
                </p>

                <p style="margin:12px 0 0; font-size:13px; color:#9ca3af;">
                  — The RescueNet Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc; padding:14px 20px; text-align:center; color:#9ca3af; font-size:12px;">
                © ${new Date().getFullYear()} RescueNet. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
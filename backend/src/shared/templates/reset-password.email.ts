interface ResetPasswordEmailProps {
  resetLink: string;
  recipientName?: string;
}

export const getResetPasswordEmail = ({
  resetLink,
  recipientName = "User",
}: ResetPasswordEmailProps) => ({
  subject: "Password Reset Request",
  text: `
    Hello ${recipientName},
    
    You recently requested to reset your password. Please use the link below to set a new password:
    
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email and your password will remain unchanged.
    
    Thanks,
    The Parrot Team
  `,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Password Reset Request</h2>
      <p>Hello ${recipientName},</p>
      <p>You recently requested to reset your password. Please click the button below to set a new password:</p>
      <p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p><code style="word-break: break-all;">${resetLink}</code></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      <p>Thanks,<br>The Parrot Team</p>
    </div>
  `,
});

export const generatePasswordResetLink = (token: string): string => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/reset-password?token=${token}`;
};

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'DriveEase <no-reply@driveease.com>',
    to,
    subject: 'Verify your DriveEase account',
    html: `
      <p>Hi,</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });
};

export const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'DriveEase <no-reply@driveease.com>',
    to,
    subject: 'Your DriveEase OTP code',
    html: `
      <p>Your verification code is <strong>${otp}</strong>.</p>
      <p>It expires in 5 minutes. Do not share it with anyone.</p>
    `,
  });
};
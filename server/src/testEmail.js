import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

try {
  await transporter.verify();
  console.log('SMTP connection successful');

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.SMTP_USER,
    subject: 'DriveEase SMTP Test',
    text: 'Testing email delivery from DriveEase.',
  });

  console.log('Message ID:', info.messageId);
  console.log('Accepted:', info.accepted);
  console.log('Rejected:', info.rejected);
} catch (error) {
  console.error('SMTP test failed:', error.message);
}
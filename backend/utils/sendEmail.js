import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const options = {
    from: `${process.env.SMTP_EMAIL} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject,
    html: message,
  };

  await transporter.sendMail(options);
};

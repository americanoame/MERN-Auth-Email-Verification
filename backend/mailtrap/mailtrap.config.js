import pkg from "mailtrap";
const { MailtrapClient } = pkg; // import the MailtrapClient class from the mailtrap package
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "andre",
};




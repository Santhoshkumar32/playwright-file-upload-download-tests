import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const GmailHelper = {
    async sendImageInGmail(toEmail, filePath) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: toEmail,
            subject: "QR Image",
            text: "Please find the QR image attached.",
            attachments: [
                {
                    filename: path.basename(filePath),
                    path: filePath,
                },
            ],
        });

        console.log("Email sent successfully with QR image");
    },
};
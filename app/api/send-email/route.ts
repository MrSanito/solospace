import nodemailer from "nodemailer"
import { NextResponse } from "next/server"


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();
        if (!name || !email || !message) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
       
        const mailOptions = {
            from: "[EMAIL_ADDRESS]",
            to: "[EMAIL_ADDRESS]",
            subject: "New Contact Form Submission",
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        };
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
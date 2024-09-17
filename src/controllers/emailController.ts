import { Request, Response } from 'express';
import { sendEmail } from '../services/emailService';

export const sendEmailController = async (req: Request, res: Response) => {
  //   const { to, attachments } = req.body;
  const { to } = req.body;
  const file = req.file; // Access uploaded file

  // Attachment Array
  const attachments = file
    ? [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ]
    : [];

  const subject = 'Your Journey Begins Here: Check Out Your Personalized Itinerary!';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: #007bff;
                color: #ffffff;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                font-size: 16px;
                line-height: 1.6;
            }
            .content h2 {
                color: #007bff;
            }
            .footer {
                text-align: center;
                padding: 10px;
                font-size: 14px;
                color: #777;
                border-top: 1px solid #e0e0e0;
                margin-top: 20px;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                padding: 10px 20px;
                font-size: 16px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Exciting Adventure Awaits!</h1>
            </div>
            <div class="content">
                <h2>Greetings!</h2>
                <p>We are thrilled to share your personalized trip itinerary. Attached, you'll find the summary plan for your upcoming adventure! </p>
                <p>We hope you have a fantastic journey filled with unforgettable experiences!</p>
                <p>Thank you for choosing Trek Seeker.</p>
            </div>
            <div class="footer">
                <p>Built with ❤️ by Trek Seeker</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(to, subject, html, attachments);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error });
  }
};

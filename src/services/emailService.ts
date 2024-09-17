import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'trekseeker.io@gmail.com',
    pass: 'wmqh ejdu ollg kohp',
  },
});

export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]) => {
  try {
    const mailOptions = {
      from: {
        name: 'Trek Seeker',
        address: 'trekseeker.io@gmail.com',
      },
      to,
      subject,
      html,
      attachments: attachments,
    };

    await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully');
  } catch (error) {
    // console.error('Error sending email:', error);
    throw error;
  }
};

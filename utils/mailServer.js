const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  ///Create a email options
  const mailOptions = {
    from: "no-reply@ipayremit.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //send a email
  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };

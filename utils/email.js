const mailer = require('nodemailer');

module.exports = async (options) => {
  const { email, subject, message } = options;
  //1) create a transporter
  const transporter = mailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    socketTimeout: 1000,
  });
  // mail options
  const mailOptions = {
    from: 'krishna<krish@gmail.com',
    to: email,
    subject,
    text: message,
  };
  //send the email
  await transporter.sendMail(mailOptions);
};

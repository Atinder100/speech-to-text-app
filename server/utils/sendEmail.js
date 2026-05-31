const nodemailer =
  require('nodemailer')

const transporter =
  nodemailer.createTransport({

    service: 'gmail',

    auth: {

      user:
        process.env.EMAIL,

      pass:
        process.env.EMAIL_PASSWORD,
    },
  })

const sendEmail =
  async (email, otp) => {

    await transporter.sendMail({

      from:
        process.env.EMAIL,

      to: email,

      subject:
        'Email Verification OTP',

      html: `
        <h2>Email Verification</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>Valid for 10 minutes.</p>
      `,
    })
  }

module.exports =
  sendEmail
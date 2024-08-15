const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail', // or use host and port for custom SMTP servers
    auth: {
        user: 'noreply.chatappiitk@gmail.com',
        pass: 'xmfx mfnk sfmi mxhb'
    }
});

function mailer(email,otp,subject,name){
    let mailOptions={};
    if(subject == "registration")
    {
         mailOptions = {
            from: 'noreplyunifiedpayments2.0@gmail.com',
            to: email,
            subject: " OTP Code for Verification",
            text: `Dear ${name}, 
Thank you for choosing ChatApp . To complete your verification process, please use the following One-Time Password (OTP):
**Your OTP Code:** ${otp}
This code is valid for the next 2 minutes. Please enter it on the verification screen to proceed.
If you did not request this verification, please ignore this email or contact our support team immediately.
Thank you for your attention.
            
Best regards,  
ChatAPP`
        };
    }
    if(subject == "forget")
        {
            mailOptions = {
                from: 'noreplyunifiedpayments2.0@gmail.com',
                to: email,
                subject: " OTP Code for Password Reset",
                text: `Dear ${name},
We received a request to reset the password for your account at ChatApp. To proceed, please use the following One-Time Password (OTP):
Your OTP Code: ${otp}
Enter this code on the password reset page to complete the process. This OTP is valid for 2 minutes. If you did not request a password reset, please ignore this email or contact our support team immediately.
For security reasons, do not share this OTP with anyone.
Thank you,

Best regards,
ChatApp`
            };
        }

    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
});
}
module.exports = { mailer };
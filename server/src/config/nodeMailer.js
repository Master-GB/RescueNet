import nodemailer from 'nodemailer';

export const sendEmail = async(to,subject,message) =>{

    try {

        const transporter = nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.SMTP_USER,
                pass:process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from:process.env.EMAIL_USER,
            to:to,
            subject:subject,
            html:message,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");

    } catch (error) {
        console.log("Error sending email:", error.message);
    }

};
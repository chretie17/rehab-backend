const db = require('../db'); // MySQL connection 
const nodemailer = require('nodemailer'); 

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Change if using another service
  auth: {
    user: 'turachretien@gmail.com', // Replace with your email
    pass: 'ruix vmny qntx ywos', // Use an App Password (not real password)
  },
}); 

// Send Email from Professional to Guardian
exports.sendEmailToGuardian = (req, res) => {
  const { professionalId, professionalEmail, guardianId, subject, message } = req.body;
  
  if (!professionalId || !professionalEmail || !guardianId || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Fetch Guardian Email Directly from Users Table
  const query = `
    SELECT 
      g.email AS guardian_email,
      g.name AS guardian_name,
      p.name AS professional_name
    FROM users g
    JOIN users p ON p.id = ?  -- Professional ID
    WHERE g.id = ?;  -- Guardian ID
  `;

  db.query(query, [professionalId, guardianId], (err, results) => {
    if (err) {
      console.error('❌ Database Error:', err);
      return res.status(500).json({ error: 'Error fetching guardian information' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No matching guardian found in the users table' });
    }

    const { guardian_email, guardian_name, professional_name } = results[0];

    // Elegant HTML Email Content
    const mailOptions = {
      from: `"${professional_name}" <${professionalEmail}>`,
      to: guardian_email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
            body {
              font-family: 'Inter', Arial, sans-serif;
              line-height: 1.6;
              color: #2C3E50;
              background-color: #F4F6F9;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 650px;
              margin: 0 auto;
              background-color: white;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
              border-radius: 12px;
              overflow: hidden;
            }
            .email-header {
              background-color: #1B3377;
              color: white;
              padding: 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
              letter-spacing: -0.5px;
            }
            .email-body {
              padding: 40px;
            }
            .email-greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #2C3E50;
            }
            .email-message {
              background-color: #F8F9FD;
              border-left: 4px solid #1B3377;
              padding: 25px;
              margin: 25px 0;
              font-size: 16px;
              line-height: 1.8;
              color: #34495E;
            }
            .email-signature {
              margin-top: 30px;
              font-size: 16px;
              color: #2C3E50;
            }
            .email-footer {
              background-color: #F4F6F9;
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #7F8C8D;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Personal Communication</h1>
            </div>
            
            <div class="email-body">
              <p class="email-greeting">Dear ${guardian_name},</p>
              
              <div class="email-message">
                ${message}
              </div>
              
              <div class="email-signature">
                Warmest regards,<br>
                ${professional_name}
              </div>
            </div>
            
            <div class="email-footer">
              This is a confidential communication
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send Email
    transporter.sendMail(mailOptions, (emailErr, info) => {
      if (emailErr) {
        console.error('❌ Error Sending Email:', emailErr);
        return res.status(500).json({ error: 'Error sending email' });
      }
      console.log('✅ Email Sent:', info.response);
      res.status(200).json({ message: 'Email sent successfully!' });
    });
  });
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // MySQL connection

// JWT secret (Hardcoded for development, NOT recommended for production)
const JWT_SECRET = 'c23db8c3f447c41e4e6504c8f546326a533b7ec4a86fa0e4dcc78cb4ee56c75364c7622ec30f4858049e4a7b2d39d53a113a47e17e50978474dc5cba167cc1aa';


exports.registerUser = (req, res) => {
  const {
    first_name,
    last_name,
    gender = null,
    profession = null,
    national_id = null,
    address = null,
    rehab_reason = null,
    email,
    username,
    password,
    role
  } = req.body;

  if (!first_name || !last_name || !email || !username || !password || !role) {
    return res.status(400).json({ error: 'First name, last name, email, username, password, and role are required' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    const query = `INSERT INTO users 
      (first_name, last_name, gender, profession, national_id, address, rehab_reason, email, username, password, role, verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [first_name, last_name, gender, profession, national_id, address, rehab_reason, email, username, hashedPassword, role, false], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      // Send admin notification email
      const adminEmail = 'ishimweimmacule46@gmail.com';
      const adminMailOptions = {
        from: '"RehabCenter System" <turachretien@gmail.com>', // This shows "RehabCenter System" instead of email
        to: adminEmail,
        subject: '🔔 New User Registration - Verification Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏥 RehabCenter</h1>
              <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Admin Notification System</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #2d3748; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                📋 New User Registration
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                A new user has registered and is waiting for your verification approval.
              </p>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4299e1;">
                <h3 style="color: #2d3748; margin-top: 0;">👤 User Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${first_name} ${last_name}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${email}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Username:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${username}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Role:</td>
                    <td style="padding: 8px 0; color: #2d3748; text-transform: capitalize;">${role}</td>
                  </tr>
                  ${profession ? `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Profession:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${profession}</td>
                  </tr>
                  ` : ''}
                  ${gender ? `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Gender:</td>
                    <td style="padding: 8px 0; color: #2d3748; text-transform: capitalize;">${gender}</td>
                  </tr>
                  ` : ''}
                  ${rehab_reason ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Rehab Reason:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${rehab_reason}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #718096; margin-bottom: 20px;">
                  Please log in to the admin panel to verify this user's account.
                </p>
                <a href="http://localhost:5173/admin/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); 
                          color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; 
                          font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  🔗 Go to Admin Panel
                </a>
              </div>
              
              <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 15px; margin-top: 20px;">
                <p style="color: #c53030; margin: 0; font-size: 14px;">
                  ⚠️ <strong>Action Required:</strong> This user cannot access their account until you approve their registration.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; color: #718096; font-size: 14px;">
              <p style="margin: 0;">RehabCenter Admin System</p>
              <p style="margin: 5px 0 0 0;">This is an automated notification email.</p>
            </div>
          </div>
        `
      };

      transporter.sendMail(adminMailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error('Error sending admin notification email:', mailErr);
        } else {
          console.log('Admin notification email sent successfully');
        }
      });

      res.status(201).json({ message: 'User registered successfully. Waiting for admin verification.' });
    });
  });
};

exports.loginUser = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(query, [identifier, identifier], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];

    if (!user.verified) {
      return res.status(403).json({ message: 'Your account is pending admin verification.' });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

      res.status(200).json({ message: 'Login successful', token, user: { id: user.id, username: user.username, role: user.role,email:user.email } });
    } catch (compareError) {
      return res.status(500).json({ error: compareError.message });
    }
  });
};

// Get User by ID
// Get User by ID
exports.getUserById = (req, res) => {
  const userId = req.params.id;

  const query = `SELECT id, first_name, last_name, gender, profession, national_id, address, rehab_reason, email, username, role 
                 FROM users WHERE id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: results[0] });
  });
};

// Get All Users
// Get All Users
exports.getAllUsers = (req, res) => {
  const query = `SELECT id, first_name, last_name, gender, profession, national_id, address, rehab_reason, email, username, verified, role FROM users`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error retrieving users' });
    if (results.length === 0) return res.status(404).json({ message: 'No users found' });
    res.status(200).json({ users: results });
  });
};


// Update User
// Update User
exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const {
    first_name,
    last_name,
    gender = null,
    profession = null,
    national_id = null,
    address = null,
    rehab_reason = null,
    email,
    role
  } = req.body;

  if (!first_name || !last_name || !email || !role) {
    return res.status(400).json({ error: 'First name, last name, email, and role are required' });
  }

  const query = `UPDATE users SET 
    first_name = ?, last_name = ?, gender = ?, profession = ?, national_id = ?, address = ?, rehab_reason = ?, email = ?, role = ? 
    WHERE id = ?`;

  db.query(query, [first_name, last_name, gender, profession, national_id, address, rehab_reason, email, role, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'User updated successfully' });
  });
};

// Delete User
exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
};
exports.verifyUser = (req, res) => {
  const { id } = req.params;
  const { verified } = req.body; // true or false

  const query = 'UPDATE users SET verified = ? WHERE id = ?';

  db.query(query, [verified, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error updating verification status' });
    res.status(200).json({ message: `User verification updated to ${verified ? 'Approved' : 'Denied'}` });
  });
};

const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto');

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'turachretien@gmail.com', // Replace with your email
    pass: 'aqtl qtnt fhzr toyy' // Replace with your app password
  }
});

// ✅ Forgot Password (Request Password Reset)
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const token = crypto.randomBytes(32).toString('hex'); // Generate a secure token
  const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour

  const query = 'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?';

  db.query(query, [token, expiresAt, email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error setting reset token' });

    if (results.affectedRows === 0) return res.status(404).json({ error: 'Email not found' });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // Send reset email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}. This link expires in 1 hour.`
    };

    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) return res.status(500).json({ error: 'Error sending email' });

      res.status(200).json({ message: 'Password reset email sent successfully' });
    });
  });
};

// ✅ Reset Password
exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

  const query = 'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()';

  db.query(query, [token], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error verifying reset token' });

    if (results.length === 0) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const userId = results[0].id;

    bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
      if (hashErr) return res.status(500).json({ error: 'Error hashing new password' });

      const updateQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?';

      db.query(updateQuery, [hashedPassword, userId], (updateErr) => {
        if (updateErr) return res.status(500).json({ error: 'Error updating password' });

        res.status(200).json({ message: 'Password reset successful' });
      });
    });
  });
};

exports.getProfessionalDetails = (req, res) => {
  const { id, role } = req.params; // Get user ID and role from request parameters

  if (role !== 'professional') {
    return res.status(403).json({ error: 'Access denied. Only professionals can view their details.' });
  }

  const query = `SELECT first_name,last_name, role, profession, email, username, gender FROM users WHERE id = ? LIMIT 1`;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error retrieving user details' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user: results[0] });
  });
};

exports.getAllGuardians = (req, res) => {
  const query = `SELECT id, fisrt_name,last_name, email, username FROM users WHERE role = 'participant'`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching guardians' });
    if (results.length === 0) return res.status(404).json({ message: 'No guardians found' });
    res.status(200).json({ guardians: results });
  });
};

exports.getAllProfessionals = (req, res) => {
  const query = `SELECT id, first_name,last_name, email, username, profession FROM users WHERE role = 'professional'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Error fetching professionals' });
    }

    console.log('Query results:', results); // ✅ Log the query results

    if (results.length === 0) {
      console.log('No professionals found'); // ✅ Log if empty
      return res.status(200).json({ professionals: [] });
    }

    res.status(200).json({ professionals: results });
  });
};

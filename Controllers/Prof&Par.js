
const db = require('../db'); // MySQL connection

exports.getAllProfessionals = (req, res) => {
    const query = `SELECT id, first_name, email, username, profession FROM users WHERE role = 'professional'`;
  
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
  
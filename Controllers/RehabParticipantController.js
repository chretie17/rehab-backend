const db = require('../db'); // MySQL connection

// ✅ Create a New Rehabilitation Participant
exports.createRehabParticipant = (req, res) => {
    const { name, gender, age, condition, guardian_id, professional_id, admission_date } = req.body;
  
    if (!name || !gender || !age || !condition || !guardian_id || !professional_id || !admission_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const query = `
      INSERT INTO rehab_participants (name, gender, age, \`condition\`, guardian_id, professional_id, admission_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
    db.query(query, [name, gender, age, condition, guardian_id, professional_id, admission_date], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Rehabilitation participant added successfully' });
    });
  };
  

// ✅ Fetch All Rehabilitation Participants with Their Assigned Guardian & Professional
exports.getRehabParticipants = (req, res) => {
    const query = `
    SELECT rp.id, rp.name, rp.gender, rp.age, rp.\`condition\`, rp.admission_date, rp.status, rp.notes, 
           g.name AS guardian_name, g.email AS guardian_email, g.username AS guardian_username,
           p.name AS professional_name, p.email AS professional_email, p.profession
    FROM rehab_participants rp
    JOIN users g ON rp.guardian_id = g.id
    JOIN users p ON rp.professional_id = p.id
    ORDER BY rp.admission_date DESC`;
  

  db.query(query, (err, results) => {
    if (err) {return results(err);}
    if (err) return res.status(500).json({ error: 'Error fetching rehabilitation participants' });
    res.status(200).json({ participants: results });
  });
};

// ✅ Fetch a Single Rehabilitation Participant by ID
exports.getRehabParticipantById = (req, res) => {
  const { id } = req.params;

  const query = `
  SELECT rp.id, rp.name, rp.gender, rp.age, rp.\`condition\`, rp.admission_date, rp.status, rp.notes,
         g.name AS guardian_name, g.email AS guardian_email, g.username AS guardian_username,
         p.name AS professional_name, p.email AS professional_email, p.profession
  FROM rehab_participants rp
  JOIN users g ON rp.guardian_id = g.id
  JOIN users p ON rp.professional_id = p.id
  WHERE rp.id = ?`;


  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching participant details' });
    if (results.length === 0) return res.status(404).json({ message: 'Participant not found' });
    res.status(200).json({ participant: results[0] });
  });
};

// ✅ Assign or Update Guardian and Professional for a Participant
exports.assignGuardianAndProfessional = (req, res) => {
  const { participantId, guardianId, professionalId } = req.body;

  if (!participantId || !guardianId || !professionalId) {
    return res.status(400).json({ error: 'Participant, guardian, and professional IDs are required' });
  }

  const query = `UPDATE rehab_participants SET guardian_id = ?, professional_id = ? WHERE id = ?`;

  db.query(query, [guardianId, professionalId, participantId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error updating participant assignment' });
    res.status(200).json({ message: 'Guardian and professional assigned successfully' });
  });
};

// ✅ Update Rehabilitation Status
exports.updateRehabStatus = (req, res) => {
  const { participantId, status, notes } = req.body;

  const query = `UPDATE rehab_participants SET status = ?, notes = ? WHERE id = ?`;

  db.query(query, [status, notes, participantId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error updating rehabilitation status' });
    res.status(200).json({ message: 'Rehabilitation status updated successfully' });
  });
};

// ✅ Delete a Rehabilitation Participant
exports.deleteRehabParticipant = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM rehab_participants WHERE id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error deleting rehabilitation participant' });
    res.status(200).json({ message: 'Rehabilitation participant deleted successfully' });
  });
};

exports.getAllProfessionals = (req, res) => {
    const query = `SELECT id, name, email, username, profession FROM users WHERE role = 'professional'`;
  
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
  exports.getAllGuardians = (req, res) => {
    const query = `SELECT id, name, email, username FROM users WHERE role = 'participant'`;
  
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching guardians' });
      if (results.length === 0) return res.status(404).json({ message: 'No guardians found' });
      res.status(200).json({ guardians: results });
    });
  };

  // ✅ Update Rehabilitation Participant Details
exports.updateRehabParticipant = (req, res) => {
    const { participantId } = req.params;
    const { name, gender, age, condition, guardian_id, professional_id, admission_date, status, notes } = req.body;
  
    if (!name || !gender || !age || !condition || !guardian_id || !professional_id || !admission_date || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const query = `
      UPDATE rehab_participants 
      SET name = ?, gender = ?, age = ?, \`condition\` = ?, guardian_id = ?, professional_id = ?, admission_date = ?, status = ?, notes = ?
      WHERE id = ?`;
  
    db.query(
      query, 
      [name, gender, age, condition, guardian_id, professional_id, admission_date, status, notes, participantId], 
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Error updating rehabilitation participant' });
        res.status(200).json({ message: 'Rehabilitation participant updated successfully' });
      }
    );
  };
  
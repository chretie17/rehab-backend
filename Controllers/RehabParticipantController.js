const db = require('../db'); // MySQL connection

// ✅ Create a New Rehabilitation Participant
exports.createRehabParticipant = (req, res) => {
  const { 
    first_name, last_name, gender, age, national_id, condition, 
    guardian_id, professional_id, counselor_id, // ✅ Add counselor_id
    admission_date, status, notes, reason, time_period 
  } = req.body;

  // Update validation (counselor_id is optional)
  if (!first_name || !last_name || !gender || !age || !condition || !guardian_id || !professional_id || !admission_date || !status || !reason || !time_period) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Handle optional counselor_id
  const counselorIdValue = counselor_id && counselor_id.trim() !== '' ? counselor_id : null;

  // Update INSERT query
  const query = `
    INSERT INTO rehab_participants 
    (first_name, last_name, gender, age, national_id, \`condition\`, guardian_id, professional_id, counselor_id, admission_date, status, notes, reason, time_period) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [first_name, last_name, gender, age, nationalIdValue, condition, guardian_id, professional_id, counselorIdValue, admission_date, status, notes, reason, time_period], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Rehabilitation participant added successfully' });
  });
};


// ✅ Fetch All Rehabilitation Participants with Their Assigned Guardian & Professional
exports.getRehabParticipants = (req, res) => {
  const query = `
    SELECT rp.id, rp.first_name, rp.last_name, rp.gender, rp.age, rp.national_id, rp.condition, rp.admission_date, rp.status, rp.notes, rp.reason, rp.time_period,
           g.first_name AS guardian_first_name, g.last_name AS guardian_last_name, g.email AS guardian_email,
           p.first_name AS professional_first_name, p.last_name AS professional_last_name, p.email AS professional_email,
           c.first_name AS counselor_first_name, c.last_name AS counselor_last_name, c.email AS counselor_email
    FROM rehab_participants rp
    JOIN users g ON rp.guardian_id = g.id
    JOIN users p ON rp.professional_id = p.id
    LEFT JOIN users c ON rp.counselor_id = c.id
    ORDER BY rp.admission_date DESC`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching rehabilitation participants' });
    res.status(200).json({ participants: results });
  });
};


// ✅ Fetch a Single Rehabilitation Participant by ID
exports.getRehabParticipantById = (req, res) => {
  const { id } = req.params;

  const query = `
  SELECT rp.id, rp.first_name, rp.last_name, rp.gender, rp.age, rp.\`condition\`, rp.admission_date, rp.status, 
         COALESCE(rp.notes, '') AS notes,  -- ✅ Ensure notes is not NULL
         g.first_name AS guardian_first_name, g.last_name AS guardian_last_name, g.email AS guardian_email,
         p.first_name AS professional_first_name, p.last_name AS professional_last_name, p.email AS professional_email
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
    const query = `SELECT id, first_name, last_name, email, username, profession FROM users WHERE role = 'professional'`;
  
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
    const query = `SELECT id, first_name, last_name, email, username FROM users WHERE role = 'participant'`;
  
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching guardians' });
      if (results.length === 0) return res.status(404).json({ message: 'No guardians found' });
      res.status(200).json({ guardians: results });
    });
  };

exports.getAllConselors = (req, res) => {
    const query = `SELECT id, first_name, last_name, email, username FROM users WHERE role = 'counselor'`;
  
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching guardians' });
      if (results.length === 0) return res.status(404).json({ message: 'No counselors found' });
      res.status(200).json({ counselors: results });
    });
  };
  
  exports.updateRehabParticipant = (req, res) => {
    const { participantId } = req.params;  
    const updateFields = req.body;

    if (!participantId) {
        return res.status(400).json({ error: 'Participant ID is required' });
    }

    if (!Object.keys(updateFields).length) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    // ✅ Ensure reserved keywords (like `condition`) are wrapped in backticks
    const fields = Object.keys(updateFields)
        .map(field => `\`${field}\` = ?`) 
        .join(', ');

    const values = Object.values(updateFields);
    values.push(participantId); // Append participantId for WHERE clause

    const query = `UPDATE rehab_participants SET ${fields} WHERE id = ?`;

    console.log("🚀 Executing Query:", query, "with values:", values); // ✅ Log SQL Query for debugging

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ error: 'Error updating rehabilitation participant' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'No participant found with the provided ID' });
        }

        res.status(200).json({ message: 'Rehabilitation participant updated successfully' });
    });
};

  
  exports.getAssignedParticipants = (req, res) => {
    const { professionalId } = req.params;
  
    const query = `
      SELECT rp.id, rp.first_name, rp.last_name, rp.gender, rp.age, rp.\`condition\`, rp.admission_date, rp.status, rp.notes,
             g.first_name AS guardian_first_name, g.last_name AS guardian_last_name, g.email AS guardian_email, g.username AS guardian_username
      FROM rehab_participants rp
      JOIN users g ON rp.guardian_id = g.id
      WHERE rp.professional_id = ?`;
  
    db.query(query, [professionalId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching assigned participants' });
      if (results.length === 0) return res.status(404).json({ message: 'No assigned participants found' });
      res.status(200).json({ participants: results });
    });
  };
  exports.updateParticipantStatus = (req, res) => {
    const { participantId } = req.params;
    const { status, notes } = req.body;
  
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const query = `UPDATE rehab_participants SET status = ?, notes = ? WHERE id = ?`;

    db.query(query, [status, notes || '', participantId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error updating participant status' });
      res.status(200).json({ message: 'Participant status updated successfully' });
    });
};

    

// ✅ Enhanced function for Guardian to see their participants and their progress
exports.getParticipantsByGuardian = (req, res) => {
  const { guardianId } = req.params; // This will be treated as either guardian or counselor ID
  
  if (!guardianId) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const query = `
    SELECT 
      rp.id, 
      rp.first_name, 
      rp.last_name, 
      rp.gender, 
      rp.age, 
      rp.national_id,
      rp.\`condition\`, 
      rp.status, 
      rp.admission_date,
      rp.time_period,
      rp.reason,
      COALESCE(rp.notes, '') AS notes,
      p.first_name AS professional_first_name, 
      p.last_name AS professional_last_name, 
      p.email AS professional_email,
      p.profession,
      DATEDIFF(CURDATE(), rp.admission_date) AS days_in_rehab,
      CASE 
        WHEN rp.status = 'Discharged' THEN '✅ Rehabilitation Completed'
        WHEN rp.status = 'Active' THEN '🔄 Currently Active' 
        WHEN rp.status = 'Transferred' THEN '📋 Transferred to Another Facility'
        ELSE '📝 Status Unknown'
      END AS status_display
    FROM rehab_participants rp
    LEFT JOIN users p ON rp.professional_id = p.id
    WHERE rp.guardian_id = ? OR rp.counselor_id = ?
    ORDER BY rp.admission_date DESC`;

  db.query(query, [guardianId, guardianId], (err, results) => {
    if (err) {
      console.error('❌ Database Error:', err);
      return res.status(500).json({ error: 'Error fetching participants' });
    }

    if (results.length === 0) {
      return res.status(200).json({
        message: 'No participants found for this guardian or counselor',
        participants: []
      });
    }

    // ✅ Add progress calculation and additional insights
    const enhancedResults = results.map(participant => {
      const progressPercentage = calculateProgressPercentage(participant.status, participant.days_in_rehab, participant.time_period);
      
      return {
        ...participant,
        progress_percentage: progressPercentage,
        is_overdue: participant.days_in_rehab > participant.time_period && participant.status === 'Active',
        time_remaining: Math.max(0, participant.time_period - participant.days_in_rehab),
        professional_info: {
          name: `${participant.professional_first_name || 'Not'} ${participant.professional_last_name || 'Assigned'}`,
          email: participant.professional_email || 'N/A',
          profession: participant.profession || 'N/A'
        }
      };
    });

    res.status(200).json({
      participants: enhancedResults,
      total_participants: enhancedResults.length,
      summary: {
        active: enhancedResults.filter(p => p.status === 'Active').length,
        discharged: enhancedResults.filter(p => p.status === 'Discharged').length,
        transferred: enhancedResults.filter(p => p.status === 'Transferred').length,
        overdue: enhancedResults.filter(p => p.is_overdue).length
      }
    });
  });
};

// ✅ Helper function to calculate progress percentage
function calculateProgressPercentage(status, daysInRehab, timePeriod) {
  if (status === 'Discharged') return 100;
  if (status === 'Transferred') return Math.min(100, Math.round((daysInRehab / timePeriod) * 100));
  if (timePeriod <= 0) return 0;
  
  const progress = Math.min(100, Math.round((daysInRehab / timePeriod) * 100));
  return Math.max(0, progress);
}

// ✅ Get detailed progress for a specific participant (Guardian view)
exports.getParticipantProgress = (req, res) => {
  const { participantId } = req.params;
  const { guardianId } = req.query; // This could be either guardian or counselor ID
  
  if (!participantId) {
    return res.status(400).json({ error: 'Participant ID is required' });
  }
  
  // Modified query to check BOTH guardian_id AND counselor_id
  const query = `
    SELECT
      rp.id,
      rp.first_name,
      rp.last_name,
      rp.gender,
      rp.age,
      rp.\`condition\`,
      rp.status,
      rp.admission_date,
      rp.time_period,
      rp.reason,
      rp.notes,
      rp.guardian_id,
      rp.counselor_id,
      p.first_name AS professional_first_name,
      p.last_name AS professional_last_name,
      p.email AS professional_email,
      p.profession,
      DATEDIFF(CURDATE(), rp.admission_date) AS days_in_rehab
    FROM rehab_participants rp
    LEFT JOIN users p ON rp.professional_id = p.id
    WHERE rp.id = ? ${guardianId ? 'AND (rp.guardian_id = ? OR rp.counselor_id = ?)' : ''}`;
    
  // If guardianId is provided, check both guardian_id and counselor_id
  const queryParams = guardianId ? [participantId, guardianId, guardianId] : [participantId];
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('❌ Database Error:', err);
      return res.status(500).json({ error: 'Error fetching participant progress' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Participant not found or access denied' });
    }
    
    const participant = results[0];
    
    // Helper function to parse time period
    const parseTimePeriodToDays = (timePeriod) => {
      if (!timePeriod || typeof timePeriod !== 'string') {
        return null;
      }
      
      const timePeriodLower = timePeriod.toLowerCase().trim();
      const match = timePeriodLower.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/);
      
      if (!match) {
        return null;
      }
      
      const number = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 'day':
        case 'days':
          return number;
        case 'week':
        case 'weeks':
          return number * 7;
        case 'month':
        case 'months':
          return number * 30;
        case 'year':
        case 'years':
          return number * 365;
        default:
          return null;
      }
    };
    
    const timePeriodInDays = parseTimePeriodToDays(participant.time_period);
    
    let progressPercentage = null;
    if (timePeriodInDays && timePeriodInDays > 0) {
      progressPercentage = Math.min(100, Math.round((participant.days_in_rehab / timePeriodInDays) * 100));
    }
    
    const timeRemaining = timePeriodInDays ? Math.max(0, timePeriodInDays - participant.days_in_rehab) : null;
    
    let expectedCompletionDate;
    
    try {
      if (participant.status === 'Discharged') {
        expectedCompletionDate = 'Completed';
      } else if (participant.status === 'Transferred') {
        expectedCompletionDate = 'Transferred';
      } else if (!timePeriodInDays) {
        expectedCompletionDate = 'Unknown';
      } else if (timeRemaining <= 0) {
        expectedCompletionDate = 'Overdue';
      } else {
        const completionTimestamp = Date.now() + (timeRemaining * 24 * 60 * 60 * 1000);
        expectedCompletionDate = new Date(completionTimestamp).toISOString().split('T')[0];
      }
    } catch (error) {
      expectedCompletionDate = 'Unknown';
    }
    
    const isOverdue = timePeriodInDays && 
                     participant.days_in_rehab > timePeriodInDays && 
                     participant.status === 'Active';
    
    // Determine the user's relationship to the participant
    const userRole = guardianId == participant.guardian_id ? 'guardian' : 'counselor';
    
    const enhancedParticipant = {
      ...participant,
      progress_percentage: progressPercentage,
      is_overdue: isOverdue || false,
      time_remaining: timeRemaining,
      expected_completion_date: expectedCompletionDate,
      time_period_in_days: timePeriodInDays,
      user_role: userRole, // Add this to show the relationship
      professional_info: {
        name: `${participant.professional_first_name || 'Not'} ${participant.professional_last_name || 'Assigned'}`,
        email: participant.professional_email || 'N/A',
        profession: participant.profession || 'N/A'
      }
    };
    
    res.status(200).json({ participant: enhancedParticipant });
  });
};
const db = require('../db'); // MySQL Connection

// ✅ Guardian requests help
exports.requestHelp = (req, res) => {
    const { guardian_id, participant_id, request } = req.body;

    if (!guardian_id || !participant_id || !request) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `INSERT INTO help_requests (guardian_id, participant_id, request) VALUES (?, ?, ?)`;

    db.query(query, [guardian_id, participant_id, request], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error submitting help request' });
        res.status(201).json({ message: 'Help request submitted successfully' });
    });
};

// ✅ Get help requests for a specific guardian
exports.getGuardianHelpRequests = (req, res) => {
    const { guardianId } = req.params;

    const query = `
        SELECT hr.id, hr.request, hr.status, hr.notes, hr.created_at, 
               p.name AS participant_name
        FROM help_requests hr
        JOIN rehab_participants p ON hr.participant_id = p.id
        WHERE hr.guardian_id = ?
        ORDER BY hr.created_at DESC
    `;

    db.query(query, [guardianId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching help requests' });
        
        console.log("📌 API Response:", results); // Log API response to check if `notes` exist
        res.status(200).json({ help_requests: results });
    });
};

// ✅ Get all help requests (Admin)
exports.getAllHelpRequests = (req, res) => {
    const query = `
        SELECT hr.id, hr.request, hr.status, hr.created_at,
               g.name AS guardian_name, p.name AS participant_name
        FROM help_requests hr
        JOIN users g ON hr.guardian_id = g.id
        JOIN rehab_participants p ON hr.participant_id = p.id
        ORDER BY hr.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ help_requests: results });
    });
};

// ✅ Update help request status
exports.updateHelpRequestStatus = (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    const query = `UPDATE help_requests SET status = ?, notes = ? WHERE id = ?`;

    db.query(query, [status, notes || '', id], (err, result) => {
        if (err) {
            console.error("❌ Error updating help request:", err);
            return res.status(500).json({ error: 'Error updating help request status' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Help request not found' });
        }

        console.log("✅ Help request updated:", result);
        res.status(200).json({ message: 'Help request status and notes updated successfully' });
    });
};



// ✅ Get all help requests and statuses
exports.getAllHelpRequests = (req, res) => {
    const query = `
        SELECT hr.id, hr.participant_id, hr.guardian_id, hr.request, hr.status, hr.notes, hr.created_at,
               g.name AS guardian_name, g.email AS guardian_email,
               p.name AS participant_name, p.age, p.condition,
               pr.name AS professional_name
        FROM help_requests hr
        JOIN users g ON hr.guardian_id = g.id
        JOIN rehab_participants p ON hr.participant_id = p.id
        LEFT JOIN users pr ON p.professional_id = pr.id
        ORDER BY hr.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ help_requests: results });
    });
};

// ✅ Get summary statistics
exports.getHelpSummary = (req, res) => {
    const query = `
        SELECT 
            COUNT(*) AS total_requests,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_requests,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_requests,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_requests
        FROM help_requests
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching help summary' });
        res.status(200).json(results[0]);
    });
};

const db = require("../db");

// ✅ Get System Summary
exports.getSystemSummary = (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM help_requests) AS total_requests,
            (SELECT COUNT(*) FROM help_requests WHERE status = 'Pending') AS pending_requests,
            (SELECT COUNT(*) FROM help_requests WHERE status = 'In Progress') AS in_progress_requests,
            (SELECT COUNT(*) FROM help_requests WHERE status = 'Resolved') AS resolved_requests,
            (SELECT COUNT(*) FROM rehab_participants) AS total_participants,
            (SELECT COUNT(*) FROM users WHERE role = 'participant') AS total_guardians,
            (SELECT COUNT(*) FROM users WHERE role = 'professional') AS total_professionals,
            (SELECT COUNT(*) FROM programs WHERE status = 'Active') AS active_programs,
            (SELECT COUNT(*) FROM chapters) AS total_chapters;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching system summary" });
        res.status(200).json(results[0]);
    });
};

// ✅ Get ALL Professionals
exports.getProfessionalReport = (req, res) => {
    const query = `
        SELECT 
            u.id, u.name, u.email, u.profession, 
            COUNT(DISTINCT rp.id) AS total_participants,
            SUM(CASE WHEN rp.status = 'Active' THEN 1 ELSE 0 END) AS active_participants,
            SUM(CASE WHEN rp.status = 'Discharged' THEN 1 ELSE 0 END) AS discharged_participants,
            SUM(CASE WHEN rp.status = 'Transferred' THEN 1 ELSE 0 END) AS transferred_participants,
            COUNT(DISTINCT p.id) AS total_programs,
            COUNT(DISTINCT c.id) AS total_chapters_supervised
        FROM users u
        LEFT JOIN rehab_participants rp ON u.id = rp.professional_id
        LEFT JOIN programs p ON u.id = p.assigned_to
        LEFT JOIN chapters c ON p.id = c.program_id
        WHERE u.role = 'professional'
        GROUP BY u.id;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching professional report" });
        res.status(200).json({ professionals: results });
    });
};


// ✅ Get ALL Guardians
exports.getGuardianReport = (req, res) => {
    const query = `
        SELECT 
            u.id AS guardian_id, u.name AS guardian_name, u.email, 
            COUNT(DISTINCT hr.id) AS total_help_requests,
            COUNT(DISTINCT rp.id) AS total_guardian_participants,
            rp.id AS participant_id, rp.name AS participant_name, rp.gender, rp.age, rp.condition, rp.status
        FROM users u
        LEFT JOIN help_requests hr ON u.id = hr.guardian_id
        LEFT JOIN rehab_participants rp ON u.id = rp.guardian_id
        WHERE u.role = 'participant'
        GROUP BY u.id, rp.id
        ORDER BY u.name, rp.name;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching guardian report" });

        // ✅ Restructure Data: Group Participants Under Their Guardians
        const guardians = {};

        results.forEach(row => {
            if (!guardians[row.guardian_id]) {
                guardians[row.guardian_id] = {
                    id: row.guardian_id,
                    name: row.guardian_name,
                    email: row.email,
                    total_help_requests: row.total_help_requests,
                    total_guardian_participants: row.total_guardian_participants,
                    participants: [] // ✅ Store participants in an array
                };
            }

            if (row.participant_id) {
                guardians[row.guardian_id].participants.push({
                    id: row.participant_id,
                    name: row.participant_name,
                    gender: row.gender,
                    age: row.age,
                    condition: row.condition,
                    status: row.status
                });
            }
        });

        res.status(200).json({ guardians: Object.values(guardians) });
    });
};

// ✅ Get ALL Guardian Participants
exports.getGuardianParticipants = (req, res) => {
    const query = `
        SELECT rp.id, rp.name, rp.gender, rp.age, rp.condition, rp.status, rp.admission_date,
               p.name AS professional_name, rp.guardian_id
        FROM rehab_participants rp
        LEFT JOIN users p ON rp.professional_id = p.id
        ORDER BY rp.admission_date DESC;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching guardian participants" });
        res.status(200).json({ participants: results });
    });
};

// ✅ Get Date-Based Help Requests (Show All Before Selecting Date Range)
exports.getDateBasedHelpRequests = (req, res) => {
    let { startDate, endDate } = req.query;
    let query = `
        SELECT DATE(created_at) AS request_date, COUNT(*) AS total_requests
        FROM help_requests
    `;
    let params = [];
    if (startDate && endDate) {
        query += " WHERE created_at BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }
    query += " GROUP BY DATE(created_at) ORDER BY request_date ASC";

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching help requests by date" });
        res.status(200).json({ help_requests: results });
    });
};

// ✅ Get Date-Based Admissions (Show All Before Selecting Date Range)
exports.getDateBasedAdmissions = (req, res) => {
    let { startDate, endDate } = req.query;
    let query = `
        SELECT DATE(admission_date) AS admission_date, COUNT(*) AS total_participants
        FROM rehab_participants
    `;
    let params = [];
    if (startDate && endDate) {
        query += " WHERE admission_date BETWEEN ? AND ? ";
        params.push(startDate, endDate);
    }
    query += " GROUP BY DATE(admission_date) ORDER BY admission_date ASC";

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Error fetching participant admissions by date" });
        res.status(200).json({ admissions: results });
    });
};

// ✅ Get Date-Based Chapter Progress (Show All Before Selecting Date Range)
exports.getChapterProgressForDateRange = (req, res) => {
    let { startDate, endDate } = req.query;

    let query = `
        SELECT cp.id AS progress_id, c.name AS chapter_name, u.name AS participant_name,
               cp.status, cp.remarks, cp.updated_at
        FROM chapter_progress cp
        JOIN chapters c ON cp.chapter_id = c.id
        JOIN users u ON cp.user_id = u.id
    `;

    let params = [];

    // ✅ Apply date filtering only if startDate & endDate exist
    if (startDate && endDate) {
        query += " WHERE cp.updated_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY) ";
        params.push(startDate, endDate);
    }

    query += " ORDER BY cp.updated_at DESC";

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("❌ Error fetching chapter progress:", err);
            return res.status(500).json({ error: "Error fetching chapter progress by date" });
        }

        res.status(200).json({ chapter_progress: results });
    });
};

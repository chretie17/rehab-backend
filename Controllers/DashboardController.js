const db = require('../db'); // MySQL Connection

// ✅ Get Dashboard Statistics
exports.getDashboardSummary = (req, res) => {
    const summaryQuery = `
        SELECT 
            (SELECT COUNT(*) FROM help_requests) AS total_requests,
            (SELECT COUNT(*) FROM help_requests WHERE status = 'Pending') AS pending_requests,
            (SELECT COUNT(*) FROM help_requests WHERE status = 'In Progress') AS in_progress_requests,
            (SELECT COUNT(*) FROM help_requests WHERE status = 'Resolved') AS resolved_requests,
            (SELECT COUNT(*) FROM rehab_participants) AS total_participants,
            (SELECT COUNT(*) FROM users WHERE role = 'guardian') AS total_guardians,
            (SELECT COUNT(*) FROM users WHERE role = 'professional') AS total_professionals,
            (SELECT COUNT(*) FROM programs WHERE status = 'Active') AS active_programs;
    `;

    const recentRequestsQuery = `
        SELECT DATE(created_at) AS request_date, COUNT(*) AS total_requests
        FROM help_requests
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY request_date ASC;
    `;

    db.query(summaryQuery, (err, summaryResults) => {
        if (err) return res.status(500).json({ error: 'Error fetching dashboard summary' });

        db.query(recentRequestsQuery, (err, recentResults) => {
            if (err) return res.status(500).json({ error: 'Error fetching recent help requests' });

            res.status(200).json({
                summary: summaryResults[0], // Summary statistics
                recent_requests: recentResults // Requests over the last 7 days
            });
        });
    });
};

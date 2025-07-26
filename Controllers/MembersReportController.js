const db = require('../db'); // MySQL connection

// ✅ Dashboard Overview Statistics
exports.getDashboardStats = (req, res) => {
  const queries = {
    totalParticipants: `SELECT COUNT(*) as count FROM rehab_participants`,
    activeParticipants: `SELECT COUNT(*) as count FROM rehab_participants WHERE status = 'Active'`,
    dischargedParticipants: `SELECT COUNT(*) as count FROM rehab_participants WHERE status = 'Discharged'`,
    transferredParticipants: `SELECT COUNT(*) as count FROM rehab_participants WHERE status = 'Transferred'`,
    totalProfessionals: `SELECT COUNT(*) as count FROM users WHERE role = 'professional'`,
    totalGuardians: `SELECT COUNT(*) as count FROM users WHERE role = 'participant'`,
    avgAge: `SELECT ROUND(AVG(age), 1) as avg_age FROM rehab_participants`,
    recentAdmissions: `SELECT COUNT(*) as count FROM rehab_participants WHERE admission_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  };

  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key}:`, err);
        results[key] = 0;
      } else {
        results[key] = result[0].count || result[0].avg_age || 0;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.status(200).json({
          success: true,
          data: {
            overview: {
              totalParticipants: results.totalParticipants,
              activeParticipants: results.activeParticipants,
              dischargedParticipants: results.dischargedParticipants,
              transferredParticipants: results.transferredParticipants,
              totalProfessionals: results.totalProfessionals,
              totalGuardians: results.totalGuardians,
              averageAge: results.avgAge,
              recentAdmissions: results.recentAdmissions
            }
          }
        });
      }
    });
  });
};

// ✅ Participants by Status Distribution
exports.getStatusDistribution = (req, res) => {
  const query = `
    SELECT 
      status,
      COUNT(*) as count,
      ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rehab_participants)), 2) as percentage
    FROM rehab_participants 
    GROUP BY status
    ORDER BY count DESC`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching status distribution' });
    
    res.status(200).json({
      success: true,
      data: {
        statusDistribution: results
      }
    });
  });
};

// ✅ Participants by Condition Analysis
exports.getConditionAnalysis = (req, res) => {
  const query = `
    SELECT 
      \`condition\`,
      COUNT(*) as count,
      ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rehab_participants)), 2) as percentage,
      ROUND(AVG(age), 1) as avg_age,
      COUNT(CASE WHEN status = 'Discharged' THEN 1 END) as discharged_count,
      COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_count
    FROM rehab_participants 
    GROUP BY \`condition\`
    ORDER BY count DESC`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching condition analysis' });
    
    res.status(200).json({
      success: true,
      data: {
        conditionAnalysis: results
      }
    });
  });
};

// ✅ Age Demographics Analysis
exports.getAgeDemographics = (req, res) => {
  const query = `
    SELECT 
      CASE 
        WHEN age BETWEEN 0 AND 12 THEN '0-12 (Child)'
        WHEN age BETWEEN 13 AND 19 THEN '13-19 (Teen)'
        WHEN age BETWEEN 20 AND 35 THEN '20-35 (Young Adult)'
        WHEN age BETWEEN 36 AND 50 THEN '36-50 (Adult)'
        WHEN age BETWEEN 51 AND 65 THEN '51-65 (Middle Age)'
        ELSE '65+ (Senior)'
      END as age_group,
      COUNT(*) as count,
      ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rehab_participants)), 2) as percentage,
      COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
      COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count
    FROM rehab_participants 
    GROUP BY age_group
    ORDER BY MIN(age)`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching age demographics' });
    
    res.status(200).json({
      success: true,
      data: {
        ageDemographics: results
      }
    });
  });
};

// ✅ Gender Distribution
exports.getGenderDistribution = (req, res) => {
  const query = `
    SELECT 
      gender,
      COUNT(*) as count,
      ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rehab_participants)), 2) as percentage,
      ROUND(AVG(age), 1) as avg_age
    FROM rehab_participants 
    GROUP BY gender
    ORDER BY count DESC`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching gender distribution' });
    
    res.status(200).json({
      success: true,
      data: {
        genderDistribution: results
      }
    });
  });
};

// ✅ Monthly Admissions Trend
exports.getMonthlyAdmissionsTrend = (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  
  const query = `
    SELECT 
      YEAR(admission_date) as year,
      MONTH(admission_date) as month,
      MONTHNAME(admission_date) as month_name,
      COUNT(*) as admissions_count,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
    FROM rehab_participants 
    WHERE YEAR(admission_date) = ?
    GROUP BY YEAR(admission_date), MONTH(admission_date), MONTHNAME(admission_date)
    ORDER BY year, month`;

  db.query(query, [year], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching monthly admissions trend' });
    
    res.status(200).json({
      success: true,
      data: {
        monthlyTrend: results,
        year: parseInt(year)
      }
    });
  });
};

// ✅ Professional Workload Analysis
exports.getProfessionalWorkload = (req, res) => {
  const query = `
    SELECT 
      p.id as professional_id,
      CONCAT(p.first_name, ' ', p.last_name) as professional_name,
      p.email as professional_email,
      p.profession,
      COUNT(rp.id) as total_participants,
      COUNT(CASE WHEN rp.status = 'Active' THEN 1 END) as active_participants,
      COUNT(CASE WHEN rp.status = 'Discharged' THEN 1 END) as discharged_participants,
      COUNT(CASE WHEN rp.status = 'Transferred' THEN 1 END) as transferred_participants,
      ROUND(AVG(rp.age), 1) as avg_participant_age
    FROM users p
    LEFT JOIN rehab_participants rp ON p.id = rp.professional_id
    WHERE p.role = 'professional'
    GROUP BY p.id, p.first_name, p.last_name, p.email, p.profession
    ORDER BY total_participants DESC`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching professional workload' });
    
    res.status(200).json({
      success: true,
      data: {
        professionalWorkload: results
      }
    });
  });
};

// ✅ Guardian Engagement Analysis
exports.getGuardianEngagement = (req, res) => {
  const query = `
    SELECT 
      g.id as guardian_id,
      CONCAT(g.first_name, ' ', g.last_name) as guardian_name,
      g.email as guardian_email,
      g.username,
      COUNT(rp.id) as total_participants,
      COUNT(CASE WHEN rp.status = 'Active' THEN 1 END) as active_participants,
      COUNT(CASE WHEN rp.status = 'Discharged' THEN 1 END) as discharged_participants,
      MIN(rp.admission_date) as first_admission,
      MAX(rp.admission_date) as latest_admission
    FROM users g
    LEFT JOIN rehab_participants rp ON g.id = rp.guardian_id
    WHERE g.role = 'participant'
    GROUP BY g.id, g.first_name, g.last_name, g.email, g.username
    HAVING total_participants > 0
    ORDER BY total_participants DESC`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching guardian engagement' });
    
    res.status(200).json({
      success: true,
      data: {
        guardianEngagement: results
      }
    });
  });
};

// ✅ Detailed Participants Report with Filters
exports.getDetailedParticipantsReport = (req, res) => {
  const {
    status,
    condition,
    gender,
    ageMin,
    ageMax,
    admissionDateFrom,
    admissionDateTo,
    professionalId,
    guardianId,
    page = 1,
    limit = 50,
    sortBy = 'admission_date',
    sortOrder = 'DESC'
  } = req.query;

  let whereConditions = [];
  let queryParams = [];

  // Build WHERE conditions based on filters
  if (status) {
    whereConditions.push('rp.status = ?');
    queryParams.push(status);
  }

  if (condition) {
    whereConditions.push('rp.`condition` LIKE ?');
    queryParams.push(`%${condition}%`);
  }

  if (gender) {
    whereConditions.push('rp.gender = ?');
    queryParams.push(gender);
  }

  if (ageMin) {
    whereConditions.push('rp.age >= ?');
    queryParams.push(parseInt(ageMin));
  }

  if (ageMax) {
    whereConditions.push('rp.age <= ?');
    queryParams.push(parseInt(ageMax));
  }

  if (admissionDateFrom) {
    whereConditions.push('rp.admission_date >= ?');
    queryParams.push(admissionDateFrom);
  }

  if (admissionDateTo) {
    whereConditions.push('rp.admission_date <= ?');
    queryParams.push(admissionDateTo);
  }

  if (professionalId) {
    whereConditions.push('rp.professional_id = ?');
    queryParams.push(professionalId);
  }

  if (guardianId) {
    whereConditions.push('rp.guardian_id = ?');
    queryParams.push(guardianId);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM rehab_participants rp
    JOIN users g ON rp.guardian_id = g.id
    JOIN users p ON rp.professional_id = p.id
    ${whereClause}`;

  // Main query with pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const allowedSortColumns = ['admission_date', 'first_name', 'last_name', 'age', 'status', 'condition'];
  const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'admission_date';
  const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  const mainQuery = `
    SELECT 
      rp.id, rp.first_name, rp.last_name, rp.gender, rp.age, rp.national_id, 
      rp.\`condition\`, rp.admission_date, rp.status, rp.notes, rp.reason, rp.time_period,
      CONCAT(g.first_name, ' ', g.last_name) as guardian_name,
      g.email as guardian_email, g.username as guardian_username,
      CONCAT(p.first_name, ' ', p.last_name) as professional_name,
      p.email as professional_email, p.profession,
      DATEDIFF(CURDATE(), rp.admission_date) as days_in_program
    FROM rehab_participants rp
    JOIN users g ON rp.guardian_id = g.id
    JOIN users p ON rp.professional_id = p.id
    ${whereClause}
    ORDER BY rp.${validSortBy} ${validSortOrder}
    LIMIT ? OFFSET ?`;

  // Execute count query first
  db.query(countQuery, queryParams, (err, countResult) => {
    if (err) return res.status(500).json({ error: 'Error fetching participants count' });
    
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / parseInt(limit));

    // Execute main query
    const mainQueryParams = [...queryParams, parseInt(limit), offset];
    db.query(mainQuery, mainQueryParams, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching detailed participants report' });
      
      res.status(200).json({
        success: true,
        data: {
          participants: results,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalRecords,
            recordsPerPage: parseInt(limit),
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1
          },
          filters: {
            status, condition, gender, ageMin, ageMax,
            admissionDateFrom, admissionDateTo, professionalId, guardianId
          },
          sorting: {
            sortBy: validSortBy,
            sortOrder: validSortOrder
          }
        }
      });
    });
  });
};

// ✅ Export Data for Reports (CSV format data)
exports.getExportData = (req, res) => {
  const { type = 'participants' } = req.query;

  let query;
  switch (type) {
    case 'participants':
      query = `
        SELECT 
          rp.id, rp.first_name, rp.last_name, rp.gender, rp.age, rp.national_id, 
          rp.\`condition\`, rp.admission_date, rp.status, rp.notes, rp.reason, rp.time_period,
          CONCAT(g.first_name, ' ', g.last_name) as guardian_name,
          g.email as guardian_email,
          CONCAT(p.first_name, ' ', p.last_name) as professional_name,
          p.email as professional_email, p.profession
        FROM rehab_participants rp
        JOIN users g ON rp.guardian_id = g.id
        JOIN users p ON rp.professional_id = p.id
        ORDER BY rp.admission_date DESC`;
      break;

    case 'professionals':
      query = `
        SELECT 
          p.id, p.first_name, p.last_name, p.email, p.profession,
          COUNT(rp.id) as total_participants,
          COUNT(CASE WHEN rp.status = 'active' THEN 1 END) as active_participants
        FROM users p
        LEFT JOIN rehab_participants rp ON p.id = rp.professional_id
        WHERE p.role = 'professional'
        GROUP BY p.id, p.first_name, p.last_name, p.email, p.profession`;
      break;

    case 'guardians':
      query = `
        SELECT 
          g.id, g.first_name, g.last_name, g.email, g.username,
          COUNT(rp.id) as total_participants
        FROM users g
        LEFT JOIN rehab_participants rp ON g.id = rp.guardian_id
        WHERE g.role = 'participant'
        GROUP BY g.id, g.first_name, g.last_name, g.email, g.username`;
      break;

    default:
      return res.status(400).json({ error: 'Invalid export type' });
  }

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching export data' });
    
    res.status(200).json({
      success: true,
      data: {
        exportType: type,
        records: results,
        totalRecords: results.length,
        exportDate: new Date().toISOString()
      }
    });
  });
};

// ✅ Summary Statistics for Date Range
exports.getDateRangeStats = (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  const queries = {
    totalAdmissions: `
      SELECT COUNT(*) as count 
      FROM rehab_participants 
      WHERE admission_date BETWEEN ? AND ?`,
    
    statusBreakdown: `
      SELECT status, COUNT(*) as count 
      FROM rehab_participants 
      WHERE admission_date BETWEEN ? AND ?
      GROUP BY status`,
    
    conditionBreakdown: `
      SELECT \`condition\`, COUNT(*) as count 
      FROM rehab_participants 
      WHERE admission_date BETWEEN ? AND ?
      GROUP BY \`condition\`
      ORDER BY count DESC`,
    
    ageStats: `
      SELECT 
        MIN(age) as min_age,
        MAX(age) as max_age,
        ROUND(AVG(age), 1) as avg_age
      FROM rehab_participants 
      WHERE admission_date BETWEEN ? AND ?`,
    
    genderBreakdown: `
      SELECT gender, COUNT(*) as count 
      FROM rehab_participants 
      WHERE admission_date BETWEEN ? AND ?
      GROUP BY gender`
  };

  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, [startDate, endDate], (err, result) => {
      if (err) {
        console.error(`Error in ${key}:`, err);
        results[key] = key === 'ageStats' ? { min_age: 0, max_age: 0, avg_age: 0 } : [];
      } else {
        results[key] = result;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.status(200).json({
          success: true,
          data: {
            dateRange: { startDate, endDate },
            totalAdmissions: results.totalAdmissions[0]?.count || 0,
            statusBreakdown: results.statusBreakdown,
            conditionBreakdown: results.conditionBreakdown,
            ageStatistics: results.ageStats[0] || { min_age: 0, max_age: 0, avg_age: 0 },
            genderBreakdown: results.genderBreakdown
          }
        });
      }
    });
  });
};
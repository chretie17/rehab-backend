const db = require('../db'); // Your MySQL connection

// Create Chapter
exports.createChapter = (req, res) => {
    const { program_id, name, description, chapter_order } = req.body;

    const query = `
        INSERT INTO chapters (program_id, name, description, chapter_order)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [program_id, name, description, chapter_order], (err, result) => {
        if (err) {
            console.error('Error creating chapter:', err);
            return res.status(500).json({ error: 'Error creating chapter' });
        }
        res.status(201).json({ message: 'Chapter created successfully', chapterId: result.insertId });
    });
};

// Get All Chapters for a Program
exports.getChaptersForProgram = (req, res) => {
    const { program_id } = req.params;

    const query = `
        SELECT * FROM chapters
        WHERE program_id = ?
        ORDER BY chapter_order
    `;
    db.query(query, [program_id], (err, results) => {
        if (err) {
            console.error('Error fetching chapters:', err);
            return res.status(500).json({ error: 'Error fetching chapters' });
        }
        res.status(200).json(results);
    });
};

// Update Chapter
exports.updateChapter = (req, res) => {
    const { id } = req.params;
    const { name, description, chapter_order } = req.body;

    const query = `
        UPDATE chapters 
        SET name = ?, description = ?, chapter_order = ?
        WHERE id = ?
    `;
    db.query(query, [name, description, chapter_order, id], (err) => {
        if (err) {
            console.error('Error updating chapter:', err);
            return res.status(500).json({ error: 'Error updating chapter' });
        }
        res.status(200).json({ message: 'Chapter updated successfully' });
    });
};

// Delete Chapter
exports.deleteChapter = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM chapters WHERE id = ?';

    db.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting chapter:', err);
            return res.status(500).json({ error: 'Error deleting chapter' });
        }
        res.status(200).json({ message: 'Chapter deleted successfully' });
    });
};

// Get Chapter Progress (for Admin)
exports.getChapterProgress = (req, res) => {
    const { program_id } = req.params;

    const query = `
        SELECT 
            chapter_progress.id, 
            programs.name AS program_name, 
            chapters.name AS chapter_name, 
            users.name AS participant_name,
            chapter_progress.status, 
            chapter_progress.remarks
        FROM chapter_progress
        JOIN programs ON chapter_progress.program_id = programs.id
        JOIN chapters ON chapter_progress.chapter_id = chapters.id
        JOIN users ON chapter_progress.user_id = users.id
        WHERE chapter_progress.program_id = ?
    `;
    db.query(query, [program_id], (err, results) => {
        if (err) {
            console.error('Error fetching chapter progress:', err);
            return res.status(500).json({ error: 'Error fetching chapter progress' });
        }
        res.status(200).json(results);
    });
};

// Add Progress to a Chapter (for Professional or Admin)
exports.addChapterProgress = (req, res) => {
    const { program_id, user_id, chapter_id, status, remarks } = req.body;

    const query = `
        INSERT INTO chapter_progress (program_id, user_id, chapter_id, status, remarks)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [program_id, user_id, chapter_id, status, remarks], (err) => {
        if (err) {
            console.error('Error adding chapter progress:', err);
            return res.status(500).json({ error: 'Error adding chapter progress' });
        }
        res.status(201).json({ message: 'Progress added successfully' });
    });
};
// Get Chapters for a Program
exports.getChaptersByProgramId = (req, res) => {
    const { programId } = req.query; // Extract programId from query params

    const query = `
        SELECT 
            chapters.id,
            chapters.name,
            chapters.description,
            chapters.chapter_order,  -- Order of chapters
            chapters.created_at,
            chapters.updated_at
        FROM chapters
        WHERE program_id = ?  -- Filter by program_id
        ORDER BY chapters.chapter_order;  -- Order by the chapter order
    `;

    db.query(query, [programId], (err, results) => {
        if (err) {
            console.error('Error fetching chapters:', err);
            return res.status(500).json({ error: 'Error fetching chapters' });
        }
        res.status(200).json(results);  // Send the chapters as a response
    });
};
// Get Chapters with Progress for a Participant
exports.getChaptersWithProgress = (req, res) => {
    const { program_id, user_id } = req.query;

    const query = `
        SELECT 
            c.id AS chapter_id, 
            c.name AS chapter_name, 
            c.description, 
            c.chapter_order, 
            IFNULL(cp.status, 'not_started') AS status, 
            cp.remarks
        FROM chapters c
        LEFT JOIN chapter_progress cp 
            ON c.id = cp.chapter_id AND cp.user_id = ?
        WHERE c.program_id = ?
        ORDER BY c.chapter_order;
    `;

    db.query(query, [user_id, program_id], (err, results) => {
        if (err) {
            console.error('Error fetching chapter progress:', err);
            return res.status(500).json({ error: 'Error fetching chapter progress' });
        }
        res.status(200).json(results);
    });
};
// Update Chapter Progress
// Update Chapter Progress
// Update Chapter Progress
exports.updateChapterProgress = (req, res) => {
    const { program_id, user_id, chapter_id, status, remarks } = req.body;

    const query = `
        INSERT INTO chapter_progress (program_id, user_id, chapter_id, status, remarks)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        remarks = VALUES(remarks),
        updated_at = CURRENT_TIMESTAMP;
    `;

    db.query(query, [program_id, user_id, chapter_id, status, remarks], (err) => {
        if (err) {
            console.error('Error updating chapter progress:', err);
            return res.status(500).json({ error: 'Error updating chapter progress' });
        }
        res.status(200).json({ message: 'Chapter progress updated successfully' });
    });
};


exports.getLastChapterProgress = (req, res) => {
    const { program_id, user_id } = req.query;

    const query = `
        SELECT 
            c.id AS chapter_id, 
            c.name AS chapter_name, 
            c.description, 
            c.chapter_order, 
            cp.status, 
            cp.remarks
        FROM chapters c
        LEFT JOIN chapter_progress cp 
            ON c.id = cp.chapter_id AND cp.user_id = ?
        WHERE c.program_id = ?
        ORDER BY 
            CASE 
                WHEN cp.status = 'in_progress' THEN 1 
                WHEN cp.status = 'completed' THEN 2 
                ELSE 3 
            END, 
            cp.updated_at DESC, 
            c.chapter_order ASC
        LIMIT 1;
    `;

    db.query(query, [user_id, program_id], (err, results) => {
        if (err) {
            console.error('Error fetching last chapter progress:', err);
            return res.status(500).json({ error: 'Error fetching last chapter progress' });
        }
        res.status(200).json(results.length > 0 ? results[0] : null);
    });
};
// Get All Progress for a Program (for Professional)
exports.getProgressForProgram = (req, res) => {
    const { program_id } = req.query;

    const query = `
        SELECT 
            cp.id AS progress_id,
            u.name AS participant_name,
            c.name AS chapter_name,
            c.description AS chapter_description,
            cp.status,
            cp.remarks,
            cp.updated_at
        FROM chapter_progress cp
        JOIN users u ON cp.user_id = u.id
        JOIN chapters c ON cp.chapter_id = c.id
        WHERE cp.program_id = ?
        ORDER BY u.name, c.chapter_order;
    `;

    db.query(query, [program_id], (err, results) => {
        if (err) {
            console.error('Error fetching progress for program:', err);
            return res.status(500).json({ error: 'Error fetching progress for program' });
        }
        res.status(200).json(results);
    });
};

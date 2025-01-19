const db = require('../db');

// Send a message
// Send a message
exports.sendMessage = (req, res) => {
    const { chat_id, sender_id, message } = req.body;

    if (!chat_id || !sender_id || !message) {
        console.error('[sendMessage] Missing required fields:', { chat_id, sender_id, message });
        return res.status(400).json({ error: 'chat_id, sender_id, and message are required' });
    }

    console.log('[sendMessage] Sending message:', { chat_id, sender_id, message });

    // Determine receiver_id based on the clicked user and the chat participants
    const sqlFetchReceiver = `
        SELECT 
            CASE 
                WHEN professional_id = ? THEN participant_id
                ELSE professional_id
            END AS receiver_id
        FROM chats
        WHERE id = ?
    `;

    db.query(sqlFetchReceiver, [sender_id, chat_id], (err, results) => {
        if (err || results.length === 0) {
            console.error('[sendMessage] Error fetching receiver:', err || 'No receiver found for chat_id');
            return res.status(500).json({ error: 'Failed to fetch receiver' });
        }

        const receiver_id = results[0].receiver_id;
        console.log(`[sendMessage] Receiver ID determined: ${receiver_id}`);

        // Insert the message into the database
        const sqlInsertMessage = `INSERT INTO messages (chat_id, sender_id, message) VALUES (?, ?, ?)`;
        db.query(sqlInsertMessage, [chat_id, sender_id, message], (err, result) => {
            if (err) {
                console.error('[sendMessage] Error inserting message:', err);
                return res.status(500).json({ error: 'Failed to send message' });
            }

            console.log(`[sendMessage] Message sent successfully with ID ${result.insertId}`);
            res.status(201).json({ 
                messageId: result.insertId, 
                message: 'Message sent successfully', 
                receiver_id 
            });
        });
    });
};
// Fetch chat history
exports.getChatHistory = (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        return res.status(400).json({ error: 'chatId is required' });
    }

    const sql = `
        SELECT m.id AS messageId, m.chat_id, m.sender_id, u.name AS sender_name, m.message, 
               m.status, m.created_at 
        FROM messages m
        JOIN users u ON m.sender_id = u.id 
        WHERE m.chat_id = ? 
        ORDER BY m.created_at ASC
    `;

    db.query(sql, [chatId], (err, results) => {
        if (err) {
            console.error('Error fetching chat history:', err);
            return res.status(500).json({ error: 'Failed to fetch chat history' });
        }

        console.log('Chat history:', results); // Log for debugging
        res.json(results);
    });
};

// Update message status (e.g., mark as read)
exports.updateMessageStatus = (req, res) => {
    const { messageId, status } = req.body;

    if (!messageId || !status) {
        return res.status(400).json({ error: 'messageId and status are required' });
    }

    const sql = `UPDATE messages SET status = ? WHERE id = ?`;

    db.query(sql, [status, messageId], (err, result) => {
        if (err) {
            console.error('Error updating message status:', err);
            return res.status(500).json({ error: 'Failed to update message status' });
        }
        res.json({ message: 'Message status updated successfully' });
    });
};

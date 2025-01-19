const db = require('../db');

// Create a conversation
exports.createConversation = (req, res) => {
    const { participant1_id, participant2_id } = req.body;

    const query = `
        INSERT IGNORE INTO conversations (participant1_id, participant2_id)
        VALUES (LEAST(?, ?), GREATEST(?, ?))
    `;
    db.query(query, [participant1_id, participant2_id, participant1_id, participant2_id], (err, results) => {
        if (err) {
            console.error('Error creating conversation:', err);
            return res.status(500).json({ error: 'Error creating conversation' });
        }

        res.status(201).json({ message: 'Conversation created successfully', conversationId: results.insertId });
    });
};

// Send a message
exports.sendMessage = (req, res) => {
    const { conversation_id, sender_id, message } = req.body;

    const query = `
        INSERT INTO messages (conversation_id, sender_id, message)
        VALUES (?, ?, ?)
    `;
    db.query(query, [conversation_id, sender_id, message], (err) => {
        if (err) {
            console.error('Error sending message:', err);
            return res.status(500).json({ error: 'Error sending message' });
        }

        res.status(201).json({ message: 'Message sent successfully' });
    });
};

// Fetch messages for a conversation
exports.getMessages = (req, res) => {
    const { conversation_id } = req.params;

    const query = `
        SELECT m.id, m.sender_id, m.message, m.created_at, u.name AS sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
    `;
    db.query(query, [conversation_id], (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ error: 'Error fetching messages' });
        }

        res.status(200).json(results);
    });
};

// Fetch all conversations for a user
exports.getConversations = (req, res) => {
    const { user_id } = req.params;

    const query = `
        SELECT c.id AS conversation_id, 
               c.participant1_id, 
               c.participant2_id,
               u1.name AS participant1_name,
               u2.name AS participant2_name,
               (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_time
        FROM conversations c
        JOIN users u1 ON c.participant1_id = u1.id
        JOIN users u2 ON c.participant2_id = u2.id
        WHERE c.participant1_id = ? OR c.participant2_id = ?
        ORDER BY last_message_time DESC
    `;
    db.query(query, [user_id, user_id], (err, results) => {
        if (err) {
            console.error('Error fetching conversations:', err);
            return res.status(500).json({ error: 'Error fetching conversations' });
        }

        res.status(200).json(results);
    });
};
exports.getAllUsers = (req, res) => {
    const { userId } = req.query;
  
    const query = `
      SELECT id, name, role FROM users
      WHERE id != ?
      ORDER BY name;
    `;
  
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Error fetching users' });
      }
      res.status(200).json(results);
    });
  };
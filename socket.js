const db = require('./db'); // Import the database connection

class SocketManager {
    constructor(io) {
        this.io = io;
        this.activeUsers = new Map(); // Track active users with userId and socketId
        this.initializeSocketEvents();
    }

    initializeSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log(`[SocketManager] Socket connected: ${socket.id}`);

            // Handle user joining
            socket.on('join', (userId) => {
                this.activeUsers.set(userId, socket.id);
                console.log(`[SocketManager] User ${userId} joined with socket ID ${socket.id}`);
            });

            // Handle sending messages
            socket.on('sendMessage', async (data) => {
                console.log(`[SocketManager] Received sendMessage event:`, data);
                await this.handleSendMessage(socket, data);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`[SocketManager] Socket disconnected: ${socket.id}`);
                this.handleDisconnect(socket);
            });
        });
    }

    async handleSendMessage(socket, data) {
        const { chat_id, sender_id, message } = data;

        if (!chat_id || !sender_id || !message) {
            console.error(`[SocketManager] Invalid data for sending message:`, data);
            socket.emit('error', { message: 'Invalid data for sending message' });
            return;
        }

        try {
            console.log(`[SocketManager] Saving message to database: chat_id=${chat_id}, sender_id=${sender_id}, message=${message}`);

            // Save message to database
            const result = await new Promise((resolve, reject) => {
                const sqlInsertMessage = `INSERT INTO messages (chat_id, sender_id, message, status) VALUES (?, ?, ?, 'sent')`;
                db.query(sqlInsertMessage, [chat_id, sender_id, message], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            console.log(`[SocketManager] Message saved with ID ${result.insertId}`);

            // Fetch the receiver's ID from the chat
            const receiverResult = await new Promise((resolve, reject) => {
                const sqlFetchReceiver = `
                    SELECT 
                        professional_id, participant_id
                    FROM chats
                    WHERE id = ?
                `;
                db.query(sqlFetchReceiver, [chat_id], (err, result) => {
                    if (err || result.length === 0) return reject(err || 'No participants found for this chat');
                    resolve(result[0]);
                });
            });

            const receiver_id = (receiverResult.professional_id === sender_id) 
                ? receiverResult.participant_id 
                : receiverResult.professional_id;

            console.log(`[SocketManager] Receiver ID for chat ${chat_id}: ${receiver_id}`);

            // Emit message to receiver if online
            const receiverSocketId = this.activeUsers.get(receiver_id);
            if (receiverSocketId) {
                console.log(`[SocketManager] Emitting message to receiver ${receiver_id} at socket ${receiverSocketId}`);
                this.io.to(receiverSocketId).emit('receiveMessage', {
                    messageId: result.insertId,
                    chat_id,
                    sender_id,
                    receiver_id,
                    message,
                    created_at: new Date(),
                });
            } else {
                console.log(`[SocketManager] Receiver ${receiver_id} is not online`);
            }

            // Emit acknowledgment to sender
            console.log(`[SocketManager] Emitting acknowledgment to sender ${sender_id}`);
            socket.emit('messageSent', {
                messageId: result.insertId,
                chat_id,
                sender_id,
                message,
                created_at: new Date(),
            });
        } catch (err) {
            console.error(`[SocketManager] Error processing message:`, err);
            socket.emit('error', { message: 'Failed to process message' });
        }
    }

    handleDisconnect(socket) {
        for (const [userId, socketId] of this.activeUsers.entries()) {
            if (socketId === socket.id) {
                this.activeUsers.delete(userId);
                console.log(`[SocketManager] User ${userId} disconnected`);
                break;
            }
        }
    }
}

module.exports = SocketManager;

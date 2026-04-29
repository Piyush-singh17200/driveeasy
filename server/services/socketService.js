const logger = require('../utils/logger');
const Message = require('../models/Message');

const connectedUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // User joins their personal room
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      connectedUsers.set(userId, socket.id);
      logger.info(`User ${userId} joined their room`);
    });

    // Admin joins admin room
    socket.on('join_admin_room', () => {
      socket.join('admin-room');
      logger.info(`Admin socket ${socket.id} joined admin-room`);
    });

    // Owner joins owner room for their cars
    socket.on('join_owner_room', (ownerId) => {
      socket.join(`owner_${ownerId}`);
    });

    // Car availability subscribe (for car detail page)
    socket.on('watch_car', (carId) => {
      socket.join(`car_${carId}`);
    });

    socket.on('unwatch_car', (carId) => {
      socket.leave(`car_${carId}`);
    });

    // Real-time chat
    socket.on('send_message', async (data) => {
      const { recipientId, message, senderId, bookingId } = data;
      try {
        if (bookingId && recipientId && senderId) {
          await Message.create({ booking: bookingId, sender: senderId, receiver: recipientId, text: message });
        }
      } catch (err) {
        logger.error('Failed to save message:', err.message);
      }
      
      io.to(`user_${recipientId}`).emit('receive_message', {
        senderId,
        message,
        bookingId,
        timestamp: new Date().toISOString(),
      });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { recipientId, senderId } = data;
      io.to(`user_${recipientId}`).emit('user_typing', { senderId });
    });

    // Notification read
    socket.on('mark_notification_read', (notificationId) => {
      // Could update DB here
    });

    // Disconnect
    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // Helper methods to emit from controllers
  io.getConnectedUsers = () => connectedUsers;
};

module.exports = socketHandler;

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Unified message handler
  socket.on('send-message', (data) => {
    const { type, chatId, message } = data;
    console.log('📨 Received message:', { type, chatId, message });

    if (type === 'Channel') {
      const eventName = `channel:${chatId}:channel-messages`;
      // Broadcast to everyone in the channel room
      socket.to(`channel:${chatId}`).emit(eventName, message);
      // Also emit to the sender for consistency (optional)
      socket.broadcast.emit(eventName, message);
    } else {
      // Direct message
      socket.broadcast.emit('direct_messages:post', message);
    }
  });

  // Unified update handler
  socket.on('update-message', (data) => {
    const { type, chatId, message } = data;
    console.log('✏️ Received message update:', { type, chatId, message });

    if (type === 'Channel') {
      const eventName = `channel:${chatId}:channel-messages:update`;
      socket.to(`channel:${chatId}`).emit(eventName, message);
      socket.broadcast.emit(eventName, message);
    } else {
      socket.broadcast.emit('direct_messages:update', message);
    }
  });

  // Join/leave rooms


  socket.on('disconnect', (reason) => {
    console.log('🔴 Client disconnected:', socket.id, 'Reason:', reason);
  });
});
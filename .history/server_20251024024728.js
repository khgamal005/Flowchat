io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Forward any channel-related events
  socket.onAny((eventName, data) => {
    if (eventName.includes(':channel-messages') || 
        eventName.includes(':channel-messages:update')) {
      console.log(`📨 Forwarding ${eventName}`, data);
      socket.broadcast.emit(eventName, data);
    }
  });

  // Direct messages
  socket.on('direct_messages:post', (message) => {
    console.log('📨 Received direct message:', message);
    socket.broadcast.emit('direct_messages:post', message);
  });

  socket.on('direct_messages:update', (updatedMessage) => {
    console.log('✏️ Received direct message update:', updatedMessage);
    socket.broadcast.emit('direct_messages:update', updatedMessage);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Client disconnected:', socket.id, 'Reason:', reason);
  });
});
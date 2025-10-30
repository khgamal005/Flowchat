const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.onAny((event, payload) => {
    console.log(`📡 Received event: ${event}`, payload);
    
    // Handle both channel and direct messages
    if (event.startsWith('channel:') || event.startsWith('direct:')) {
      io.emit(event, payload);
      console.log(`🔁 Broadcasted: ${event}`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Client disconnected:', socket.id, 'Reason:', reason);
  });
});
import 'dotenv/config';
import { app, connectDB, httpServer } from './app.js';
import { initSocket } from './socket/index.js';
import { startExpiryJob } from './jobs/expireBookings.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  initSocket(httpServer, app);
  startExpiryJob(app.get('io'));
  httpServer.listen(PORT, () =>
    console.log(`🚀 Server + Socket.IO listening on http://localhost:${PORT}`)
  );
});
import mongoose from 'mongoose';

const connection = {};

<<<<<<< HEAD
async function dbConnect() {
  if (connection.isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit - let the app handle errors gracefully
    connection.isConnected = 0;
  }
}

export default dbConnect;

=======
async function dbConnect(maxRetries = 3) {
  if (connection.isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${attempt}/${maxRetries}`);
      const db = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority',
      });

      connection.isConnected = db.connections[0].readyState === 1;
      console.log('✅ MongoDB connected successfully');
      return db;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

export default dbConnect;
>>>>>>> blackboxai/login-mongodb-fix

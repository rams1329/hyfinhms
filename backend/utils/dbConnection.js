import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

// Pool options
const poolOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let isConnected = false;

// Connect and monitor
export async function connectDB() {
  if (isConnected) {
    console.log('MongoDB: Already connected.');
    return mongoose.connection;
  }
  try {
    await mongoose.connect(mongoUri, poolOptions);
    isConnected = true;
    console.log('MongoDB: Connection pool established.');

    mongoose.connection.on('connected', () => {
      console.log('MongoDB: Connected.');
    });
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB: Connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('MongoDB: Disconnected.');
    });
    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('MongoDB: Reconnected.');
    });
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB: Initial connection error:', err);
    throw err;
  }
}

export function getConnection() {
  return mongoose.connection;
}

export async function closeDB() {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB: Connection pool closed.');
  }
}

function isStrongPassword(password) {
  // At least 8 chars, one uppercase, one lowercase, one digit, one special char
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return strongRegex.test(password);
} 
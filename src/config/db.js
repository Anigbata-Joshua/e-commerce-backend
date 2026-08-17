import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => {
    console.log('✅ Connected to the e-commerce database successfully');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ e-commerce database error:', error.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Disconnected from e-commerce database. Attempting to reconnect...');
});

export async function connectDatabase() {
    const options = {
        autoIndex: !env.isProduction,
        maxPoolSize: 50,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };

    try {
        await mongoose.connect(env.mongoUri, options);
    } catch (error) {
        console.error('❌ Critical: Initial connection failed ->', error.message);
        if (env.nodeEnv !== 'test') {
            process.exit(1);
        } else {
            throw error;
        }
    }
}

export async function closeDatabase() {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed safely');
    } catch (error) {
        console.error('❌ Error during MongoDB shutdown:', error.message);
    }
}

export default mongoose;

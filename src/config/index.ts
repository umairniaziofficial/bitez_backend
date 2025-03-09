import dotenv from 'dotenv';

dotenv.config();

export const config = {
    mongodb: {
        uri: process.env.MONGODB_URI!,
    },
    server: {
        port: parseInt(process.env.PORT!),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key'
    }
};

import express from "express";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../model/User";
import logger from '../utils/logger';
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            logger.warn('Registration attempt with missing fields');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Basic email format validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            logger.warn('Registration attempt with invalid email format');
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn(`Registration attempt with existing email: ${email}`);
            return res.status(409).json({ error: 'Email already registered' });
        }

        const user = new User({ email, password });
        await user.save();

        logger.info(`User registered successfully: ${email}`);
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        logger.error('Registration error:', { error: errorMessage });
        return res.status(400).json({ error: errorMessage });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email,
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const token = jwt.sign({
            email,
            role: user.role
        }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        res.status(400).json({ error: errorMessage });
    }
});

export default router;
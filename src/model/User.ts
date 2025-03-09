import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser {
    _id?: mongoose.ObjectId;
    email: string;
    password: string;
    role: string | 'user';
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const userModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default userModel;

// models/authModel.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // Define salt rounds for bcrypt

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};
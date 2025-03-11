// models/userModel.ts
import pool from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hashPassword } from './authModel';

// Define the User interface
interface User {
    user_id: number;
    username: string;
    password?: string; // Optional, as we don't always need to return it
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    global_role_id: number | null; // Add global_role_id
}

// Find a user by username
export const findUserByUsername = async (username: string): Promise<User | null> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM Users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0] as User;
    } finally {
        connection.release();
    }
};

// Find a user by ID
export const findUserById = async (userId: number): Promise<User | null> => {
    const connection = await pool.getConnection();
    console.log(userId);
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT user_id, username, email, first_name, last_name, global_role_id FROM Users WHERE user_id = ?',
        [userId]
      );
      if (rows.length === 0) {
        return null;
      }
      return rows[0] as User;
    } finally {
      connection.release();
    }
};

// Create a new user
export const createUser = async (username: string, passwordHash: string, email:string | null, first_name: string | null, last_name: string | null, globalRoleId: number | null = 2): Promise<number> => {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query<ResultSetHeader>(
            'INSERT INTO Users (username, password, email, first_name, last_name, global_role_id) VALUES (?, ?, ?, ?, ?, ?)',
            [username, passwordHash, email, first_name, last_name, globalRoleId]
        );
        return result.insertId;
    } finally {
        connection.release();
    }
};

// Update user details (excluding password)
export const updateUser = async (userId: number, email: string | null, first_name: string | null, last_name: string | null): Promise<void> => {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'UPDATE Users SET email = ?, first_name = ?, last_name = ? WHERE user_id = ?',
        [email, first_name, last_name, userId]
      );
    } finally {
      connection.release();
    }
};

// Change user password
export const changePassword = async (userId: number, newPasswordHash: string): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        await connection.query('UPDATE Users SET password = ? WHERE user_id = ?', [newPasswordHash, userId]);
    } finally {
        connection.release();
    }
};

// Get all users (for admin)
export const getAllUsers = async (): Promise<User[]> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>('SELECT user_id, username, email, first_name, last_name, global_role_id FROM Users');
    return rows as User[];
  } finally {
    connection.release();
  }
};
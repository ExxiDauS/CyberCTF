// controllers/authController.ts
import { Request, Response } from 'express';
import * as userModel from '../models/userModel';
import * as authModel from '../models/authModel';
import * as roleModel from '../models/roleModel';
import { generateToken } from '../utils/jwt';
import { RowDataPacket } from 'mysql2';
import pool from '../db';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, first_name, last_name } = req.body;

    if (!username || !password || !email) {
      res.status(400).json({ message: 'Username, password, and email are required' });
      return;
    }

    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      res.status(409).json({ message: 'Username already exists' });
      return;
    }

    const hashedPassword = await authModel.hashPassword(password);
    // Create user with default global_role_id = 2 (Student)
    const userId = await userModel.createUser(username, hashedPassword, email, first_name, last_name, 2);

    // Get user's global permissions
    const globalPermissions = await roleModel.getUserGlobalPermissions(userId);
    const coursePermissions = await roleModel.getAllUserCoursePermissions(userId);

    const token = generateToken(userId, globalPermissions, coursePermissions);

    res.status(201).json({ message: 'User registered successfully', token });
    return;

  } catch (error) {
    console.error('Error in register controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};



export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
        return;
    }

    const user = await userModel.findUserByUsername(username);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    const isPasswordValid = await authModel.comparePassword(password, user.password!);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    // Get user's global roles
    const globalPermissions = await roleModel.getUserGlobalPermissions(user.user_id);
    const coursePermissions = await roleModel.getAllUserCoursePermissions(user.user_id);


    const token = generateToken(user.user_id, globalPermissions, coursePermissions);

    res.status(200).json({ message: 'Login successful', token });
    return;

  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Current password and new password are required' });
        return;
    }

    try {
        const user = await userModel.findUserById(userId);
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        const userWithPassword = await userModel.findUserByUsername(user.username);

        if (!userWithPassword) {
            res.status(404).json({ message: 'User not found' });
            return;
        }


        const isPasswordValid = await authModel.comparePassword(currentPassword, userWithPassword.password!);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid current password' });
            return;
        }

        const newPasswordHash = await authModel.hashPassword(newPassword);
        await userModel.changePassword(userId, newPasswordHash);

        res.status(200).json({ message: 'Password changed successfully' });
        return;

    } catch(error) {
        console.error('Error in changePassword controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }
};
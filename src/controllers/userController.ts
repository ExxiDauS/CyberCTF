// controllers/userController.ts
import { Request, Response } from 'express';
import * as userModel from '../models/userModel';

// Get current user's profile (CORRECT)
export const getCurrentUser = async (req: Request, res: Response) => {
    const userId = req.user.userId;

    try {
      const user = await userModel.findUserById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
      return;
    } catch (error) {
      console.error('Error in getCurrentUser controller:', error);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }
};

// Update user's profile (CORRECT)
export const updateUser = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { email, first_name, last_name } = req.body;

  try {
    await userModel.updateUser(userId, email, first_name, last_name);
    res.json({ message: 'User updated successfully' });
    return;
  } catch (error) {
    console.error('Error in updateUser controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};

// Get all users (Admin Only) (CORRECT)
export const getUsers = async (req: Request, res: Response) => {
  try {
      const users = await userModel.getAllUsers();
      res.json(users);
      return;
  } catch (error) {
      console.error("Error in getUsers controller:", error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
  }
};

// Get user by ID (Admin Only) (CORRECTED - Added Input Validation)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    console.log(req.params);

    // *** CRITICAL INPUT VALIDATION: Check if userIdParam is valid ***
    if (!userIdParam || isNaN(parseInt(userIdParam, 10))) {
        console.log("getUserById: Invalid userIdParam. Returning 400."); // LOGGING
        res.status(400).json({ message: 'Invalid user ID' }); // Send 400 Bad Request
        return; // Stop execution
    }

    const userId = parseInt(req.params.userId, 10);
    console.log("getUserById: userId (after parseInt):", userId); // LOGGING

    const user = await userModel.findUserById(userId);

    if (!user) {
      console.log("getUserById: User not found. Returning 404."); // LOGGING
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log("getUserById: User found:", user);  // LOGGING
    res.json(user);
    return;

  } catch (error) {
    console.error('Error in getUserById controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};
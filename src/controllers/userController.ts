// controllers/userController.ts
import { Request, Response } from "express";
import * as userModel from '../models/userModel';  // Import the User model

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error("Error in getUsers controller:", error);
        res.status(500).json({ error: 'Internal Server Error' }); // Send a 500 error
    }
};
// models/userModel.ts (NEW FILE - Model)
import pool from '../db'; // Import the connection pool
import { RowDataPacket } from 'mysql2';

// Define the User interface (adjust fields to match your table)
interface User {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    // ... other fields ...
}

export const getAllUsers = async (): Promise<User[]> => {
    try {
        const connection = await pool.getConnection(); // Get a connection
        console.log("haiya")
        try {
            const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM Users');
            return rows as User[]; // Type assertion to User[]
        } finally {
            connection.release(); // *Always* release the connection
        }
    } catch (error) {
        console.error("Error in getAllUsers model:", error);
        throw error; // Re-throw to be handled by the controller
        // or:  return []; // Return an empty array (depending on your error strategy)
    }
};
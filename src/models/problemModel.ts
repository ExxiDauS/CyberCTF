// models/problemModel.ts
import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Problem {
    pro_id: number;
    pro_name: string;
    pro_description: string | null;
    created_by: number | null;
    created_date: string;
}

interface CourseProblem {
    pro_cour_id: number;
    pro_id: number;
    course_id: number;
    added_by: number | null;
    added_date: string;
    expiration_date: string | null;
}

interface Submission {
    sub_id: number;
    pro_cour_id: number;
    user_id: number;
    status: boolean;
    submission_date: string;
}

// Create a new problem
export const createProblem = async (pro_name: string, pro_description: string, userId: number): Promise<number> => {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query<ResultSetHeader>(
            'INSERT INTO Problems (pro_name, pro_description, created_by) VALUES (?, ?, ?)',
            [pro_name, pro_description, userId]
        );
        return result.insertId;
    } finally {
        connection.release();
    }
};

// Add a problem to a course (bridge table)
export const addProblemToCourse = async (pro_id: number, course_id: number, added_by: number, expiration_date: string | null): Promise<number> => {
     const connection = await pool.getConnection();
    try {
        const [result] = await connection.query<ResultSetHeader>(
            'INSERT INTO CourseProblems (pro_id, course_id, added_by, expiration_date) VALUES (?, ?, ?, ?)',
            [pro_id, course_id, added_by, expiration_date]
        );
        return result.insertId;
    } finally {
        connection.release();
    }
};

// Create a submission
export const createSubmission = async (pro_cour_id: number, user_id: number, status: boolean): Promise<number> => {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query<ResultSetHeader>(
            'INSERT INTO Submissions (pro_cour_id, user_id, status) VALUES (?, ?, ?)',
            [pro_cour_id, user_id, status]
        );
        return result.insertId;
    } finally {
        connection.release();
    }
};

// Get all problems
export const getAllProblems = async (): Promise<Problem[]> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM Problems');
        return rows as Problem[];
    } finally {
        connection.release();
    }
};

// Get problems for a specific course
export const getProblemsByCourseId = async (courseId: number): Promise<any[]> => { //any for join query
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT p.*, cp.pro_cour_id, cp.expiration_date
         FROM Problems p
         JOIN CourseProblems cp ON p.pro_id = cp.pro_id
         WHERE cp.course_id = ?`,
        [courseId]
      );
      return rows as any[];
    } finally {
      connection.release();
    }
};

// Get a submission status for a user and problem (in a course)
export const getSubmissionStatus = async (userId: number, pro_cour_id: number): Promise<Submission | null> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM Submissions WHERE user_id = ? AND pro_cour_id = ?',
            [userId, pro_cour_id]
        );
        if (rows.length > 0) {
            return rows[0] as Submission;
        }
        return null;
    } finally {
        connection.release();
    }
};

// Helper Function to check user is enrolled in a course or not
export const isUserEnrolled = async (userId: number, courseId: number): Promise<boolean> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM UserCourseRoles WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );
        return rows.length > 0;
    } finally {
        connection.release();
    }
};
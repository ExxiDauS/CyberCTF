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
    answer: string | null;
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
export const createOrUpdateSubmission = async (pro_cour_id: number, user_id: number, answer: string): Promise<Submission> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if a submission already exists
        const [existingSubmissions] = await connection.query<RowDataPacket[]>(
            'SELECT sub_id, submission_date FROM Submissions WHERE pro_cour_id = ? AND user_id = ?',
            [pro_cour_id, user_id]
        );

        let sub_id: number;
        let submission_date: string;

        if (existingSubmissions.length > 0) {
            // Submission exists, update the answer and set status to false
            sub_id = existingSubmissions[0].id;
            submission_date = existingSubmissions[0].submission_date; // Keep existing date
            await connection.query(
                'UPDATE Submissions SET answer = ?, status = false WHERE sub_id = ?',
                [answer, sub_id]
            );
        } else {
            // Submission doesn't exist, create a new one with status set to false
            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO Submissions (pro_cour_id, user_id, status, answer) VALUES (?, ?, false, ?)',
                [pro_cour_id, user_id, answer]
            );
            sub_id = result.insertId;

            // Fetch the submission_date *after* the insert.
            const [newSubmission] = await connection.query<RowDataPacket[]>(
                'SELECT submission_date FROM Submissions WHERE sub_id = ?',
                [sub_id]
            );
            submission_date = newSubmission[0].submission_date;


        }

        await connection.commit();

        // Construct the Submission object
        const submission: Submission = {
            sub_id,
            pro_cour_id,
            user_id,
            status: false,
            submission_date,
            answer,
        };
        return submission;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Submit submission
export const submitSubmission = async (pro_cour_id: number, user_id: number, std_answer: string): Promise<Submission | null> => {
    const connection = await pool.getConnection();
    try {
        // Find the submission
        const [submissions] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM Submissions WHERE pro_cour_id = ? AND user_id = ?',
            [pro_cour_id, user_id]
        );

        if (submissions.length === 0) {
            return null; // Submission not found
        }

        const submission = submissions[0] as Submission;

        // Compare answers and update status
        if (submission.answer === std_answer) {
            await connection.query(
                'UPDATE Submissions SET status = true WHERE sub_id = ?',
                [submission.sub_id]
            );
            submission.status = true; // Update the local copy
        }
        //else don't do anything.

        return submission;

    } catch (error) {
        throw error; // Re-throw for controller to handle
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

//get all submissions by course ID
export const getSubmissionsByCourse = async (courseId: number): Promise<Submission[]> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT s.sub_id, s.pro_cour_id, s.user_id, s.status, s.submission_date, u.username
             FROM Submissions s
            JOIN CourseProblems cp ON s.pro_cour_id = cp.pro_cour_id
            JOIN Users u ON s.user_id = u.user_id
             WHERE cp.course_id = ?
             ORDER BY s.submission_date DESC`,
            [courseId]
        );
        return rows as Submission[];
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
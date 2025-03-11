import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Course {
  course_id: number;
  course_name: string;
  description: string;
  created_by: number | null;
}

// Create a new course
export const createCourse = async (courseName: string, courseDescription: string, userId: number): Promise<number> => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO Courses (course_name, description, created_by) VALUES (?, ?, ?)',
      [courseName, courseDescription, userId]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

// Update a course
export const updateCourse = async (courseId: number, courseName: string, courseDescription: string): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE Courses SET course_name = ?, description = ? WHERE course_id = ?',
      [courseName, courseDescription, courseId]
    );
  } finally {
    connection.release();
  }
};

// Get all courses
export const getAllCourses = async (): Promise<Course[]> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM Courses');
        return rows as Course[];
    } finally {
        connection.release();
    }
};

// Get enrolled courses for a user
export const getEnrolledCourses = async (userId: number): Promise<Course[]> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT c.*
             FROM Courses c
             JOIN UserCourseRoles ucr ON c.course_id = ucr.course_id
             WHERE ucr.user_id = ?`,
            [userId]
        );
        return rows as Course[];
    } finally {
        connection.release();
    }
};

// Enroll a user in a course
export const enrollUserInCourse = async (userId: number, courseId: number, courseRoleId: number = 3): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        // Check if the user is already enrolled
        const [existing] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM UserCourseRoles WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );
        if (existing.length > 0) {
          return; // Already enrolled, do nothing.  Or throw an error.
        }

        await connection.query(
            'INSERT INTO UserCourseRoles (user_id, course_id, course_role_id) VALUES (?, ?, ?)',
            [userId, courseId, courseRoleId] // Assuming 'Student' role ID is 3
        );
    } finally {
        connection.release();
    }
};

// Unenroll a user from a course
export const unenrollUserFromCourse = async (userId: number, courseId: number): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        await connection.query(
            'DELETE FROM UserCourseRoles WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );
    } finally {
        connection.release();
    }
};

export const getCourseById = async (courseId: number): Promise<Course | null> => {
  const connection = await pool.getConnection();
  try {
      const [rows] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM Courses WHERE course_id = ?',
          [courseId]
      );
      if (rows.length === 0) {
          return null; // Course not found
      }
      return rows[0] as Course;
  } finally {
      connection.release();
  }
};
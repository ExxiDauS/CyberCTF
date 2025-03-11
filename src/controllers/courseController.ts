import { Request, Response } from 'express';
import * as courseModel from '../models/courseModel';
import * as roleModel from '../models/roleModel'; // Import roleModel

// Create a new course (Admin only)
export const createCourse = async (req: Request, res: Response) => {
  const { course_name, course_description } = req.body;

  if (!course_name || !course_description) {
      res.status(400).json({ message: 'Course name and description are required' });
      return;
  }

  try {
    const userId = (req as any).user.userId;
    const courseId = await courseModel.createCourse(course_name, course_description, userId);

    // Automatically enroll and assign Lecturer role (course_role_id = 1):
    await roleModel.assignCourseRole(userId, courseId, 1);

    res.status(201).json({ message: 'Course created successfully', courseId });
    return;
  } catch (error) {
    console.error('Error in createCourse controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};

// Update a course (Teacher of the course or Admin)
export const updateCourse = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId, 10);
  const { course_name, course_description } = req.body;

  if (!course_name || !course_description) {
      res.status(400).json({ message: 'Course name and description are required' });
      return;
  }

  try {
    await courseModel.updateCourse(courseId, course_name, course_description);
    res.json({ message: 'Course updated successfully' });
    return;
  } catch (error) {
    console.error('Error in updateCourse controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};

// Get all courses (for everyone)
export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const courses = await courseModel.getAllCourses();
        res.json(courses);
        return;
    } catch (error) {
        console.error("Error in getAllCourses controller:", error);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }
};

// Get enrolled courses (for the current user)
export const getEnrolledCourses = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const courses = await courseModel.getEnrolledCourses(userId);
        res.json(courses);
    } catch (error) {
        console.error("Error in getEnrolledCourses controller:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Enroll in a course (for the current user)
export const enrollInCourse = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const courseId = parseInt(req.params.courseId, 10);

        if (isNaN(courseId)) {
            res.status(400).json({ message: 'Invalid course ID' });
            return;
        }

        await courseModel.enrollUserInCourse(userId, courseId);
        res.status(200).json({ message: 'Successfully enrolled in course' });

    } catch (error) {
        console.error("Error in enrollInCourse controller:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Unenroll from a course
export const unenrollFromCourse = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const courseId = parseInt(req.params.courseId, 10);

      if (isNaN(courseId)) {
        res.status(400).json({ message: 'Invalid course ID' });
        return;
      }

      await courseModel.unenrollUserFromCourse(userId, courseId);
      res.status(200).json({ message: 'Successfully unenrolled from course' });
    } catch (error) {
      console.error('Error in unenrollFromCourse controller:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getCourseById = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId, 10);

  if (isNaN(courseId)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
  }

  try {
      const course = await courseModel.getCourseById(courseId);
      if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
      }
      res.json(course);
  } catch (error) {
      console.error('Error in getCourseById controller:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};
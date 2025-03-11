import { Router } from 'express';
import * as courseController from '../controllers/courseController';
import { authenticate, isAdmin, isTeacherOrAdmin, hasCoursePermission, hasGlobalPermission } from '../middleware/authMiddleware';

const router = Router();

// Create a course (Admin only)
router.post('/', authenticate, hasGlobalPermission('create_course'), courseController.createCourse);

// Update a course (Teacher or Admin)
router.put('/:courseId', authenticate, hasCoursePermission('courseId', 'edit_course'), courseController.updateCourse);

// Get all courses (for everyone)
router.get('/all', authenticate, courseController.getAllCourses);

// Get enrolled courses for the current user
router.get('/enrolled', authenticate, courseController.getEnrolledCourses);

// Enroll in a course
router.post('/:courseId/enroll', authenticate, courseController.enrollInCourse);

// Unenroll from a course.
router.delete('/:courseId/unenroll', authenticate, courseController.unenrollFromCourse);

// NEW: Get course details by courseId
router.get('/:courseId', authenticate, courseController.getCourseById);

export default router;
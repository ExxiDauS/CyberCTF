// routes/problems.ts
import { Router } from 'express';
import * as problemController from '../controllers/problemController';
import { authenticate, hasGlobalPermission, hasCoursePermission } from '../middleware/authMiddleware';

const router = Router();

// Create a problem (Admin only)
router.post('/', authenticate, hasGlobalPermission('manage_users'), problemController.createProblem);

// Add a problem to a course (Teacher/TA of that course, or Admin)
router.post('/course/:courseId', authenticate, hasCoursePermission('courseId', 'edit_course'), problemController.addProblemToCourse);

// Create a submission (Student enrolled in the course)
router.post('/submissions', authenticate, problemController.createSubmission); // No extra middleware needed

// Get all problems (Admin)
router.get('/', authenticate, hasGlobalPermission('manage_users'), problemController.getAllProblems);

// Get problems for a specific course (for course detail page)
router.get('/course/:courseId', authenticate, problemController.getProblemsByCourseId); // No extra middleware

// Get submission status
router.get('/submissions/:pro_cour_id', authenticate, problemController.getSubmissionStatus); // No extra middleware needed.


export default router;
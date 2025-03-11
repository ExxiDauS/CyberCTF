import { Router } from 'express';
import * as rolesController from '../controllers/rolesController';
import { authenticate, isAdmin, isTeacherOrAdmin, hasGlobalPermission, hasCoursePermission } from '../middleware/authMiddleware';

const router = Router();

// Assign a global role (Admin only) - Use hasGlobalPermission
router.post('/global', authenticate, hasGlobalPermission('manage_users'), rolesController.assignGlobalRole);

// Assign a course role (Teacher or Admin)
router.post('/course/:courseId', authenticate, hasCoursePermission('courseId', 'edit_course'), rolesController.assignCourseRole);

// Get all global roles (Admin only, requires 'manage_users')
router.get('/global', authenticate, hasGlobalPermission('manage_users'), rolesController.getAllGlobalRoles);

//get all course roles (Admin only, requires 'manage_users')
router.get('/course', authenticate, hasGlobalPermission('manage_users'), rolesController.getAllCourseRoles);

// Get user permissions (for logged-in user)
router.get('/my-permissions', authenticate, rolesController.getUserPermissions);

// Get user permissions for a specific course (for logged-in user)
router.get('/my-permissions/:courseId', authenticate, rolesController.getUserPermissions);

export default router;
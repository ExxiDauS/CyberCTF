// routes/users.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, isAdmin, hasGlobalPermission } from '../middleware/authMiddleware';

const router = Router();

// Get all users (protected, admin only) - Use hasGlobalPermission
router.get('/', authenticate, hasGlobalPermission('manage_users'), userController.getUsers);

// Get user by ID (protected, admin only) - Use hasGlobalPermission
router.get('/getUser/:userId', authenticate, hasGlobalPermission('manage_users'), userController.getUserById);

// Get current user (protected)
router.get('/me', authenticate, userController.getCurrentUser);

// Update current user (protected)
router.put('/me', authenticate, userController.updateUser);

export default router;
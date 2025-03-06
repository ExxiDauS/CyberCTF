// routes/users.ts
import { Router } from "express";
import * as userController from '../controllers/userController'; // Import controller

const router = Router();

// api/users
router.get('/', userController.getUsers);

export default router;
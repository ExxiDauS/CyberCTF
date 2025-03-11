import { Request, Response } from 'express';
import * as roleModel from '../models/roleModel';

// Assign a global role to a user (Admin only)
export const assignGlobalRole = async (req: Request, res: Response) => {
  const { userId, roleId } = req.body;

  if (!userId || !roleId) {
    res.status(400).json({ message: 'userId and roleId are required' });
    return;
  }

  try {
    await roleModel.assignGlobalRole(userId, roleId);
    res.json({ message: 'Global role assigned successfully' });
    return;
  } catch (error) {
    console.error('Error in assignGlobalRole controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};

// Assign a course role to a user (Teacher or Admin)
export const assignCourseRole = async (req: Request, res: Response) => {
  const { userId, courseRoleId } = req.body;
  const courseId = parseInt(req.params.courseId, 10);

  if (!userId || !courseRoleId) {
      res.status(400).json({ message: 'userId and courseRoleId are required' });
      return;
  }

  try {
    await roleModel.assignCourseRole(userId, courseId, courseRoleId);
    res.json({ message: 'Course role assigned successfully' });
    return;
  } catch (error) {
    console.error('Error in assignCourseRole controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};

// Get all global roles (Admin)
export const getAllGlobalRoles = async (req: Request, res: Response) => {
  try {
    const globalRoles = await roleModel.getAllGlobalRoles();
    res.json(globalRoles);
    return;
  } catch (error) {
    console.error('Error in getAllGlobalRoles controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};

// Get all course roles (Admin)
export const getAllCourseRoles = async (req: Request, res: Response) => {
  try {
    const courseRoles = await roleModel.getAllCourseRoles();
    res.json(courseRoles);
    return;
  } catch (error) {
    console.error('Error in getAllCourseRoles controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};
// Modified getUserPermissions to return both global and course permissions.
export const getUserPermissions = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const courseId = req.params.courseId ? parseInt(req.params.courseId, 10) : undefined;

    try {
      const globalPermissions = await roleModel.getUserGlobalPermissions(userId);
      const coursePermissions = courseId ? await roleModel.getUserCoursePermissions(userId, courseId) : [];
      res.json({ globalPermissions, coursePermissions }); // combine global and permissions in the course
      return
    } catch (error) {
        console.error('Error in getUserPermissions controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }
};
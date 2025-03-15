// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Or a more specific user type
    }
  }
}

function parseCookies(cookieHeader: string | undefined | null): Record<string, string> {
  const cookieObj: Record<string, string> = {};
  if (!cookieHeader) {
    return cookieObj;
  }

  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim(); // Use optional chaining and trim
    if (key) { // Make sure key exists
      const value = parts.join('=').trim();  //Re-join in case value has '='
      cookieObj[key] = value;
    }
  });

  return cookieObj;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.token;
  console.log(cookies);

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return; // Return to stop execution.  Do NOT call next()
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return; // Return; do NOT call next()
  }

  req.user = decoded;
  next(); // Call next() to proceed to the next middleware/route handler
};

// Middleware to check for a specific global permission
export const hasGlobalPermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.globalPermissions.includes(permission)) {
            res.status(403).json({ message: `Forbidden: ${permission} permission required` });
            return; //  <--- ADD RETURN HERE.  Do NOT call next()
        }
        next(); // Call next() if the user HAS the permission.
    };
};

// Middleware to check for a specific course permission
export const hasCoursePermission = (courseIdParamName: string, permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const courseId = parseInt(req.params[courseIdParamName], 10);

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;  // <--- ADD RETURN HERE
        }

        // Check if the user has the required global permission (e.g., admin)
        if (req.user.globalPermissions.includes(permission)) {
          return next(); // Early return if has global permission
        }

        const coursePerms = req.user.coursePermissions.find(
            (cp: any) => cp.courseId === courseId
        );

        if (!coursePerms || !coursePerms.permissions.includes(permission)) {
            res.status(403).json({ message: `Forbidden: ${permission} permission required for this course` });
            return; // <--- ADD RETURN HERE
        }

        next(); // Call next() if the user has the required permission.
    };
};

// Admin is now hasGlobalPermission
export const isAdmin = hasGlobalPermission('manage_users');
// Teacher is now hasCoursePermission with edit_course
export const isTeacherOrAdmin = (courseIdParamName: string) =>  hasCoursePermission(courseIdParamName, 'edit_course');
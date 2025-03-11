import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Assign a global role to a user
export const assignGlobalRole = async (userId: number, globalRoleId: number): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.query('UPDATE Users SET global_role_id = ? WHERE user_id = ?', [globalRoleId, userId]);
  } finally {
    connection.release();
  }
};

// Assign a course role to a user
export const assignCourseRole = async (userId: number, courseId: number, courseRoleId: number): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    // Check if the user already has a role in this course, if so, update it
    const [existing] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM UserCourseRoles WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (existing.length > 0) {
      await connection.query(
        'UPDATE UserCourseRoles SET course_role_id = ? WHERE user_id = ? AND course_id = ?',
        [courseRoleId, userId, courseId]
      );
    } else {
      await connection.query(
        'INSERT INTO UserCourseRoles (user_id, course_id, course_role_id) VALUES (?, ?, ?)',
        [userId, courseId, courseRoleId]
      );
    }
  } finally {
    connection.release();
  }
};

// Get a user's global role permissions
export const getUserGlobalPermissions = async (userId: number): Promise<string[]> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT gr.permissions
       FROM Users u
       JOIN GlobalRoles gr ON u.global_role_id = gr.global_role_id
       WHERE u.user_id = ?`,
            [userId]
        );

        if (rows.length === 0 || !rows[0].permissions) {
            return []; // No global role or no permissions
        }

        // Robust JSON parsing with error handling:
        let permissionIds: number[] = [];
        try {
            if (typeof rows[0].permissions === 'string') {
                permissionIds = JSON.parse(rows[0].permissions);
            } else if (Array.isArray(rows[0].permissions)) {
                // It might already be an array (depending on how MySQL handles JSON)
                permissionIds = rows[0].permissions;
            } else {
                console.error("Invalid permissions format:", rows[0].permissions);
                return []; // Or throw an error, depending on your needs
            }
        } catch (error) {
            console.error("Error parsing global permissions JSON:", error, "Raw data:", rows[0].permissions);
            return []; // Return an empty array on parsing failure
        }


        // Now fetch the permission descriptions
        const [permissionRows] = await connection.query<RowDataPacket[]>(
          `SELECT permission_description FROM GlobalPermissions WHERE permission_id IN (?)`,
          [permissionIds]
        );

        return permissionRows.map(row => row.permission_description);

    } finally {
        connection.release();
    }
};

// Get a user's course permissions for a specific course.
export const getUserCoursePermissions = async (userId: number, courseId: number): Promise<string[]> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT cr.permissions
       FROM UserCourseRoles ucr
       JOIN CourseRoles cr ON ucr.course_role_id = cr.course_role_id
       WHERE ucr.user_id = ? AND ucr.course_id = ?`,
            [userId, courseId]
        );

        if (rows.length === 0 || !rows[0].permissions) {
            return [];  // No course role, or role has no permissions
        }

        // Robust JSON parsing with error handling:
        let permissionIds: number[] = [];
        try {
           if (typeof rows[0].permissions === 'string') {
                permissionIds = JSON.parse(rows[0].permissions);
            } else if (Array.isArray(rows[0].permissions)) {
                permissionIds = rows[0].permissions;
            } else {
                console.error("Invalid permissions format:", rows[0].permissions);
                return [];
            }
        } catch (error) {
            console.error("Error parsing course permissions JSON:", error, "Raw data:", rows[0].permissions);
            return []; // Return an empty array on parsing failure
        }


        const [permissionRows] = await connection.query<RowDataPacket[]>(
          `SELECT permission_description FROM CoursePermissions WHERE permission_id IN (?)`,
          [permissionIds]
        );
        return permissionRows.map(row => row.permission_description);


    } finally {
        connection.release();
    }
};

//get all global roles
export const getAllGlobalRoles = async (): Promise<{ global_role_id: number; role_name: string }[]> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>('SELECT global_role_id, role_name FROM GlobalRoles');
    return rows as { global_role_id: number; role_name: string }[];
  } finally {
    connection.release();
  }
};

//get all course roles
export const getAllCourseRoles = async (): Promise<{ course_role_id: number; role_name: string }[]> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT course_role_id, role_name FROM CourseRoles'
    );
    return rows as { course_role_id: number; role_name: string }[];
  } finally {
    connection.release();
  }
};

export const getCourseRoleById = async (courseRoleId: number): Promise<{ course_role_id: number; role_name: string; permissions: string[] } | null> => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT course_role_id, role_name, permissions FROM CourseRoles WHERE course_role_id = ?',
            [courseRoleId]
        );

        if (rows.length === 0) {
          return null
        }

        const role = rows[0] as { course_role_id: number; role_name: string; permissions: any };

        // Robust JSON Parsing with error handling:
        if (role.permissions) {
          try {
            if(typeof role.permissions === 'string') {
              role.permissions = JSON.parse(role.permissions);
            } else if (!Array.isArray(role.permissions)) { // Check if it not an array
                console.error("Invalid permissions format (getCourseRoleById):", role.permissions);
                role.permissions = []; //Set to empty array if not string or array
            }
          } catch (error) {
            console.error('Error parsing permissions JSON (getCourseRoleById):', error, "Raw Data", role.permissions);
            role.permissions = []; // Set to an empty array on parsing failure.
          }
        } else {
            role.permissions = []; // Ensure permissions is an array even if null/undefined
        }
        return role as {course_role_id: number; role_name: string; permissions: string[]}

    } finally {
        connection.release();
    }
};

// Get all course permissions of a user by combining permissions from all courses
export const getAllUserCoursePermissions = async (userId: number): Promise<{ courseId: number; permissions: string[] }[]> => {
    const connection = await pool.getConnection();
    try {
        const [courseRoles] = await connection.query<RowDataPacket[]>(
            `SELECT ucr.course_id, cr.permissions
             FROM UserCourseRoles ucr
             JOIN CourseRoles cr ON ucr.course_role_id = cr.course_role_id
             WHERE ucr.user_id = ?`,
            [userId]
        );

        const allPermissions = await Promise.all(courseRoles.map(async (courseRole) => {

          // Robust JSON parsing:
          let permissions: string[] = [];
          try{
            if(courseRole.permissions){
              let permissionIds: number[];
              if(typeof courseRole.permissions === 'string') {
                permissionIds = JSON.parse(courseRole.permissions as string);
                } else if (Array.isArray(courseRole.permissions)) { // Check if it's already an array
                  permissionIds = courseRole.permissions;
                } else {
                  console.error("Invalid permissions format in getAllUserCoursePermissions:", courseRole.permissions);
                  permissionIds = [];
                }

                const [permissionRows] = await connection.query<RowDataPacket[]>(
                  `SELECT permission_description FROM CoursePermissions WHERE permission_id IN (?)`,
                  [permissionIds]
                );
                permissions = permissionRows.map(row => row.permission_description);
              }
            } catch (error) {
              console.error("Error parsing course permissions JSON (getAllUserCoursePermissions):", error, "Raw data:", courseRole.permissions);
              // permissions array will remain empty
            }
            return {
                courseId: courseRole.course_id,
                permissions: permissions,  // This is now guaranteed to be an array
            };

        }));

        return allPermissions;

    } finally {
        connection.release();
    }
};
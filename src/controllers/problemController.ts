// controllers/problemController.ts
import { Request, Response } from 'express';
import * as problemModel from '../models/problemModel';

// Create a new problem (Admin only)
export const createProblem = async (req: Request, res: Response) => {
    const { pro_name, pro_description } = req.body;
    const userId = (req as any).user.userId;

    if (!pro_name || !pro_description) {
        res.status(400).json({ message: 'Problem name and description are required' });
        return; // <--- Add return here
    }

    try {
        const pro_id = await problemModel.createProblem(pro_name, pro_description, userId);
        res.status(201).json({ message: 'Problem created successfully', pro_id });
        return; // <--- Add return here (optional but good practice)
    } catch (error) {
        console.error('Error in createProblem controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return; // <--- Add return here
    }
};

// Add a problem to a course (Teacher/TA of the course, or Admin)
export const addProblemToCourse = async (req: Request, res: Response) => {
    const { pro_id } = req.body;
    const courseId = parseInt(req.params.courseId, 10);
    const userId = (req as any).user.userId;
    const { expiration_date } = req.body;

    if (isNaN(courseId) || !pro_id ) {
        res.status(400).json({ message: 'Invalid course ID or problem ID' });
        return; // <--- Add return here
    }

    try {
        const pro_cour_id = await problemModel.addProblemToCourse(pro_id, courseId, userId, expiration_date);
        res.status(201).json({ message: 'Problem added to course successfully', pro_cour_id });
        return; // <--- Add return here (optional but good practice)
    } catch (error) {
        console.error('Error in addProblemToCourse controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return; // <--- Add return here
    }
};

// Create a submission (Student enrolled in the course)
export const createSubmission = async (req: Request, res: Response) => {
    const { pro_cour_id, answer } = req.body;
    const userId = (req as any).user.userId;

    if (!pro_cour_id) {
        res.status(400).json({ message: 'Problem-Course ID is required' });
        return;
    }

    try {
        const submission = await problemModel.createOrUpdateSubmission(pro_cour_id, userId, answer);
        // Determine if it was created or updated (same time-based check as before)
        const now = new Date();
        const submissionDate = new Date(submission.submission_date);
        const timeDiff = Math.abs(now.getTime() - submissionDate.getTime());
        const created = timeDiff < 1000; // Created within the last second

        if (created) {
            res.status(201).json({ message: 'Submission created successfully', submission });
        } else {
            res.status(200).json({ message: 'Submission updated successfully', submission });
        }
        return;

    } catch (error: any) {
        console.error('Error in createSubmission controller:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
        return;
    }
};

export const submitSubmission = async (req: Request, res: Response) => {
    const { pro_cour_id, std_answer } = req.body;
    const userId = (req as any).user.userId;


    if (!pro_cour_id || !std_answer) {
        res.status(400).json({ message: 'Problem-Course ID and standard answer are required' });
        return;
    }

    try {
        const submission = await problemModel.submitSubmission(pro_cour_id, userId, std_answer);

        if (!submission) {
            res.status(404).json({ message: 'Submission not found' });
            return;
        }

        if (submission.status) {
          res.status(200).json({ message: 'Submission submitted and answer is correct', submission });
        }
        else {
          res.status(200).json({ message: 'Submission submitted, but the answer does not match', submission });
        }

    } catch (error: any) {
        console.error('Error in submitSubmission controller:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Get all problems (Admin)
export const getAllProblems = async (req: Request, res: Response) => {
    try {
        const problems = await problemModel.getAllProblems();
        res.json(problems);
        return; // <--- Add return here (optional but good practice)
    } catch (error) {
        console.error('Error in getAllProblems controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return; // <--- Add return here
    }
};

// Get problems by course ID (for course detail page)
export const getProblemsByCourseId = async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId, 10);
    if(isNaN(courseId)) {
        res.status(400).json({message: "Invalid course ID"})
        return; // <--- Add return here
    }
    try {
      const problems = await problemModel.getProblemsByCourseId(courseId);
      res.json(problems);
      return; // <--- Add return here (optional but good practice)
    } catch (error) {
      console.error('Error in getProblemsByCourseId controller:', error);
      res.status(500).json({ message: 'Internal Server Error' });
      return; // <--- Add return here
    }
};

// Get submission status (for a specific user and problem in a course)
export const getSubmissionStatus = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const pro_cour_id = parseInt(req.params.pro_cour_id, 10);
    if(isNaN(pro_cour_id)) {
        res.status(400).json({message: "Invalid pro_cour_id"})
        return; // <--- Add return here
    }

    try {
        const submission = await problemModel.getSubmissionStatus(userId, pro_cour_id);
        res.json({ submission });
        return; // <--- Add return here (optional but good practice)
    } catch (error) {
        console.error('Error in getSubmissionStatus controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return; // <--- Add return here
    }
};

//get submissions by course ID
export const getSubmissionsByCourse = async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId, 10);

    if (isNaN(courseId)) {
        res.status(400).json({ message: 'Invalid course ID' });
        return;
    }

    try {
        const submissions = await problemModel.getSubmissionsByCourse(courseId);
        res.status(200).json(submissions);
        return;
    } catch (error) {
        console.error('Error in getSubmissionsByCourse controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }
};

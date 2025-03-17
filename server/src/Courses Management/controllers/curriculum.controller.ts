// Create new file: server/src/Courses Management/controllers/curriculum.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import asyncHandler from '../../utils/asyncHandler';
import { curriculumMappingService } from '../services/curriculum-mapping.service';

class CurriculumController {
  /**
   * Get curriculum topics by subject
   */
  getTopicsBySubject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subject, curriculum } = req.query;
    
    if (!subject || !curriculum) {
      return res.status(400).json({
        success: false
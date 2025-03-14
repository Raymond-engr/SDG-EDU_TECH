// server/src/controllers/lms.controller.ts
import { Response } from 'express';
import { lmsSyncService } from '../services/lms-sync.service';
import { courseSyncService } from '../services/course-sync.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { BadRequestError, NotFoundError } from '../utils/customErrors';
import asyncHandler from '../utils/asyncHandler';
import User from '../models/user.model';

class LmsController {
  /**
   * Synchronize current user with LMS platforms
   */
  syncUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await lmsSyncService.syncUser(req.user._id);
    
    res.json({
      success: true,
      message: 'User synchronized with LMS platforms',
      data: result
    });
  });

  /**
   * Synchronize a specific user with LMS platforms (admin only)
   */
  syncSpecificUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    const result = await lmsSyncService.syncUser(userId);
    
    res.json({
      success: true,
      message: `User ${user.email} synchronized with LMS platforms`,
      data: result
    });
  });
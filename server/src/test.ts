import { Response } from 'express';
import Content from '../models/content.model';
import User from '../../models/user.model';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/customErrors';
import asyncHandler from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import mongoose from 'mongoose';

class ContentController {
  // Create new content
  createContent = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Only teachers and admins can create content
    if (!['teacher', 'admin'].includes(req.user.role)) {
      throw new ForbiddenError('Only teachers and admins can create content');
    }

    const { 
      title, description, subject, grade_level, content_type, format,
      language, file_url, file_size, thumbnail_url, tags, is_downloadable
    } = (req as any).validated.body;

    // Admins can approve content directly
    const approved = req.user.role === 'admin';

    const content = await Content.create({
      title,
      description,
      subject,
      grade_level,
      content_type,
      format,
      language: language || req.user.preferred_language || 'en',
      creator: req.user._id,
      file_url,
      file_size,
      thumbnail_url,
      tags,
      is_downloadable,
      votes: {
        upvotes: 0,
        downvotes: 0,
        voters: []
      },
      approved,
      is_moderated: false,
      views: 0,
      downloads: 0
    });

    // Add this content to user's contributions
    await User.findByIdAndUpdate(req.user._id, {
      $push: { contributions: content._id }
    });

    res.status(201).json({
      success: true,
      message: approved ? 'Content created and published' : 'Content created and pending approval',
      data: content
    });
  });

  // Get content list with filters
  getContentList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { 
      subject, grade_level, content_type, format, language,
      approved, sort, page = 1, limit = 10, search
    } = (req as any).validated.query;

    const query: any = {};

    // Filter options
    if (subject) query.subject = subject;
    if (grade_level) query.grade_level = { $in: grade_level.split(',') };
    if (content_type) query.content_type = content_type;
    if (format) query.format = format;
    if (language) query.language = language;

    // Only admins and teachers can see unapproved content, but teachers can only see their own
    if (approved !== undefined) {
      if (req.user.role === 'admin') {
        query.approved = approved === 'true';
      } else if (req.user.role === 'teacher' && approved === 'false') {
        query.approved = false;
        query.creator = req.user._id;
      } else {
        query.approved = true;
      }
    } else if (req.user.role === 'student') {
      query.approved = true;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { created_at: -1 };
    } else if (sort === 'popular') {
      sortOption = { views: -1 };
    } else if (sort === 'most_downloaded') {
      sortOption = { downloads: -1 };
    } else if (sort === 'highest_rated') {
      sortOption = { 'votes.upvotes': -1 };
    } else {
      // Default sort is newest
      sortOption = { created_at: -1 };
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: sortOption,
      select: 'title description subject grade_level content_type format language creator thumbnail_url votes approved views downloads created_at',
      populate: {
        path: 'creator',
        select: 'name'
      }
    };

    // Using mongoose-paginate-v2 plugin
    const contents = await Content.paginate(query, options);

    res.json({
      success: true,
      data: contents
    });
  });

  // Get content details by ID
  getContentById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const contentId = req.params.id;

    const content = await Content.findById(contentId)
      .populate('creator', 'name email');

    if (!content) {
      throw new NotFoundError('Content not found');
    }

    // If content is not approved, only admin or creator can view it
    if (!content.approved && 
        req.user.role !== 'admin' && 
        content.creator._id.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('This content is not yet approved');
    }

    // Increment view count
    content.views += 1;
    await content.save();

    res.json({
      success: true,
      data: content
    });
  });

  // Update content
  updateContent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const contentId = req.params.id;
    
    // Find content and check permission
    const content = await Content.findById(contentId);
    if (!content) {
      throw new NotFoundError('Content not found');
    }

    // Only admin or the creator can update
    if (req.user.role !== 'admin' && content.creator.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Not authorized to update this content');
    }

    const {
      title, description, subject, grade_level, content_type, format,
      language, file_url, file_size, thumbnail_url, tags, is_downloadable
    } = (req as any).validated.body;

    // Update fields
    if (title) content.title = title;
    if (description) content.description = description;
    if (subject) content.subject = subject;
    if (grade_level) content.grade_level = grade_level;
    if (content_type) content.content_type = content_type;
    if (format) content.format = format;
    if (language) content.language = language;
    if (file_url) content.file_url = file_url;
    if (file_size) content.file_size = file_size;
    if (thumbnail_url) content.thumbnail_url = thumbnail_url;
    if (tags) content.tags = tags;
    if (is_downloadable !== undefined) content.is_downloadable = is_downloadable;

    // If not admin and content was already approved, set back to pending
    if (req.user.role !== 'admin' && content.approved) {
      content.approved = false;
    }

    await content.save();

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });
  });

  // Delete content
  deleteContent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const contentId = req.params.id;
    
    const content = await Content.findById(contentId);
    if (!content) {
      throw new NotFoundError('Content not found');
    }

    // Only admin or creator can delete
    if (req.user.role !== 'admin' && content.creator.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Not authorized to delete this content');
    }

    // Remove content ID from user's contributions
    await User.findByIdAndUpdate(content.creator, {
      $pull: { contributions: content._id }
    });

    // Remove content
    await Content.findByIdAndDelete(contentId);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  });

  // Vote on content
  voteContent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const contentId = req.params.id;
    const { vote } = (req as any).validated.body;

    if (!['up', 'down'].includes(vote)) {
      throw new BadRequestError('Invalid vote type. Must be "up" or "down"');
    }

    const content = await Content.findById(contentId);
    if (!content) {
      throw new NotFoundError('Content not found');
    }

    const userId = req.user._id;
    
    // Check if user has already voted
    const existingVoteIndex = content.votes.voters.findIndex(
      (voter: any) => voter.user.toString() === userId.toString()
    );

    // If user has already voted
    if (existingVoteIndex > -1) {
      const existingVote = content.votes.voters[existingVoteIndex].vote;
      
      // If user is changing their vote
      if (existingVote !== vote) {
        // Remove previous vote
        if (existingVote === 'up') {
          content.votes.upvotes -= 1;
        } else {
          content.votes.downvotes -= 1;
        }
        
        // Add new vote
        if (vote === 'up') {
          content.votes.upvotes += 1;
        } else {
          content.votes.downvotes += 1;
        }

        // Update the vote type
        content.votes.voters[existingVoteIndex].vote = vote;
      } else {
        // User is removing their vote
        if (vote === 'up') {
          content.votes.upvotes -= 1;
        } else {
          content.votes.downvotes -= 1;
        }

        // Remove voter from the array
        content.votes.voters.splice(existingVoteIndex, 1);
      }
    } else {
      // User is voting for the first time
      if (vote === 'up') {
        content.votes.upvotes += 1;
      } else {
        content.votes.downvotes += 1;
      }

      // Add user to voters
      content.votes.voters.push({
        user: userId,
        vote
      });
    }

    // Check if content should be auto-moderated due to high downvotes
    const totalVotes = content.votes.upvotes + content.votes.downvotes;
    const downvoteRatio = totalVotes > 0 ? content.votes.downvotes / totalVotes : 0;
    
    // If more than 70% are downvotes and there are at least 5 votes, mark for moderation
    if (downvoteRatio > 0.7 && totalVotes >= 5) {
      content.is_moderated = true;
      
      // If more than 90% are downvotes and there are at least 10 votes, unapprove it
      if (downvoteRatio > 0.9 && totalVotes >= 10) {
        content.approved = false;
      }
    }

    await content.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        upvotes: content.votes.upvotes,
        downvotes: content.votes.downvotes,
        userVote: vote
      }
    });
  });

  // Download content
  downloadContent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const contentId = req.params.id;

    const content = await Content.findById(contentId);
    if (!content) {
      throw new NotFoundError('Content not found');
    }

    // Check if content is approved
    if (!content.approved) {
      throw new ForbiddenError('This content is not available for download');
    }

    // Check if content is downloadable
    if (!content.is_downloadable) {
      throw new ForbiddenError('This content is not downloadable');
    }

    // Increment download count
    content.downloads += 1;
    await content.save();

    // Add to user's download history
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        download_history: {
          content_id: contentId,
          downloaded_at: new Date()
        }
      }
    });

    // Return the file URL (in a real application, you might generate a signed URL or stream the file)
    res.json({
      success: true,
      message: 'Content ready for download',
      data: {
        file_url: content.file_url,
        file_size: content.file_size,
        title: content.title
      }
    });
  });
}

export const contentController = new ContentController();
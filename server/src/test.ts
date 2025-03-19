// Example enhancement for lms-sync.service.ts
import mongoose from 'mongoose';
import User from '../../models/user.model';
import { moodleApiService } from './moodle-api.service';
import { openEdxApiService } from './open-edx-api.service';
import { NotFoundError, BadRequestError } from '../../utils/customErrors';
import logger from '../../utils/logger';

class LmsSyncService {
  /**
   * Synchronize a user with LMS platforms
   * Creates accounts if they don't exist
   */
  async syncUser(userId: string | mongoose.Types.ObjectId): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info(`Syncing user ${user.email} with LMS platforms`);
    
    // Track which LMS platforms have been synced
    const syncResults = {
      moodle: { success: false, message: '', accountId: null },
      openEdx: { success: false, message: '', accountId: null }
    };

    // Try to sync with Moodle
    try {
      // Check if user already has a Moodle account linked
      const moodleUser = await this.findOrCreateMoodleUser(user);
      syncResults.moodle = {
        success: true,
        message: 'User synchronized with Moodle',
        accountId: moodleUser.id
      };
      
      // Update user record with Moodle ID if not already set
      if (!user.lmsAccounts?.moodleId) {
        // Initialize lmsAccounts if it doesn't exist
        if (!user.lmsAccounts) {
          user.lmsAccounts = { moodleId: moodleUser.id };
        } else {
          user.lmsAccounts.moodleId = moodleUser.id;
        }
        await user.save();
      }
    } catch (error) {
      logger.error(`Moodle sync failed for user ${user.email}:`, error);
      syncResults.moodle = { 
        success: false, 
        message: `Moodle sync failed: ${error.message || 'Unknown error'}`,
        accountId: null 
      };
    }

    // Try to sync with Open edX
    try {
      // Check if user already has an Open edX account linked
      const edxUser = await this.findOrCreateOpenEdxUser(user);
      syncResults.openEdx = {
        success: true,
        message: 'User synchronized with Open edX',
        accountId: edxUser.id
      };
      
      // Update user record with Open edX ID if not already set
      if (!user.lmsAccounts?.openEdxId) {
        // Initialize lmsAccounts if it doesn't exist
        if (!user.lmsAccounts) {
          user.lmsAccounts = { openEdxId: edxUser.id };
        } else {
          user.lmsAccounts.openEdxId = edxUser.id;
        }
        await user.save();
      }
    } catch (error) {
      logger.error(`Open edX sync failed for user ${user.email}:`, error);
      syncResults.openEdx = { 
        success: false, 
        message: `Open edX sync failed: ${error.message || 'Unknown error'}`,
        accountId: null 
      };
    }

    // Return the results
    return {
      userId: user._id,
      email: user.email,
      syncResults
    };
  }

  /**
   * Find or create a user in Moodle
   */
  private async findOrCreateMoodleUser(user: any): Promise<any> {
    // If user already has a Moodle ID, try to fetch that user
    if (user.lmsAccounts?.moodleId) {
      try {
        const moodleUser = await moodleApiService.getUser(user.lmsAccounts.moodleId);
        return moodleUser;
      } catch (error) {
        // If user not found in Moodle (could have been deleted), create a new one
        if (error.status === 404) {
          logger.warn(`Moodle user ${user.lmsAccounts.moodleId} not found, creating new account`);
        } else {
          throw error;
        }
      }
    }

    // Create a new Moodle user
    const moodleUser = await moodleApiService.createUser({
      username: `${user.email.split('@')[0]}_${Math.floor(Math.random() * 1000)}`,
      password: this.generateTempPassword(), // Generate a secure random password
      firstname: user.name.split(' ')[0] || 'User',
      lastname: user.name.split(' ')[1] || user.name.split(' ')[0] || 'Account',
      email: user.email,
      preferences: [
        {
          type: 'auth_forcepasswordchange',
          value: false // Don't force password change since user won't directly interact with Moodle
        },
        {
          type: 'lang',
          value: user.preferred_language || 'en'
        }
      ]
    });

    return moodleUser;
  }

  /**
   * Find or create a user in Open edX
   */
  private async findOrCreateOpenEdxUser(user: any): Promise<any> {
    // If user already has an Open edX ID, try to fetch that user
    if (user.lmsAccounts?.openEdxId) {
      try {
        const edxUser = await openEdxApiService.getUser(user.lmsAccounts.openEdxId);
        return edxUser;
      } catch (error) {
        // If user not found in Open edX (could have been deleted), create a new one
        if (error.status === 404) {
          logger.warn(`Open edX user ${user.lmsAccounts.openEdxId} not found, creating new account`);
        } else {
          throw error;
        }
      }
    }

    // Create a new Open edX user
    const edxUser = await openEdxApiService.createUser({
      username: `${user.email.split('@')[0]}_${Math.floor(Math.random() * 1000)}`,
      email: user.email,
      name: user.name,
      password: this.generateTempPassword(), // Generate a secure random password
      language: user.preferred_language || 'en'
    });

    return edxUser;
  }

  /**
   * Generate a secure temporary password for LMS accounts
   * Users won't directly access these accounts, so we generate a secure random password
   */
  private generateTempPassword(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // ... other methods for course synchronization etc.
}

export const lmsSyncService = new LmsSyncService();
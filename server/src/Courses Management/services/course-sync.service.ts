// server/src/services/course-sync.service.ts
import { moodleService } from './moodle.service';
import { openEdxService } from './openedx.service';
import UnifiedCourse from '../models/unified-course.model';
import logger from '../utils/logger';

class CourseSyncService {
  /**
   * Synchronize courses from both LMS platforms
   */
  async syncCourses(): Promise<{ added: number; updated: number; failed: number }> {
    const result = {
      added: 0,
      updated: 0,
      failed: 0
    };

    try {
      // Fetch courses from both platforms
      const [moodleCourses, openEdxCourses] = await Promise.all([
        this.fetchMoodleCourses(),
        this.fetchOpenEdxCourses()
      ]);

      // Process each batch of courses
      await this.processCourses(moodleCourses, result);
      await this.processCourses(openEdxCourses, result);

      logger.info(`Course synchronization completed: ${result.added} added, ${result.updated} updated, ${result.failed} failed`);
      return result;
    } catch (error: any) {
      logger.error(`Course synchronization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch courses from Moodle
   */
  private async fetchMoodleCourses(): Promise<any[]> {
    try {
      return await moodleService.getCourses();
    } catch (error) {
      logger.error('Failed to fetch Moodle courses', error);
      return [];
    }
  }

  /**
   * Fetch courses from Open edX
   */
  private async fetchOpenEdxCourses(): Promise<any[]> {
    try {
      return await openEdxService.getCourses();
    } catch (error) {
      logger.error('Failed to fetch Open edX courses', error);
      return [];
    }
  }

  /**
   * Process courses and update the unified courses collection
   */
  private async processCourses(
    courses: any[],
    result: { added: number; updated: number; failed: number }
  ): Promise<void> {
    for (const course of courses) {
      try {
        // Check if course already exists
        const existingCourse = await UnifiedCourse.findOne({
          source: course.source,
          original_id: course.original_id
        });

        if (existingCourse) {
          // Update existing course
          await UnifiedCourse.findByIdAndUpdate(existingCourse._id, {
            $set: {
              title: course.title,
              short_title: course.short_title,
              description: course.description,
              category: course.category,
              format: course.format,
              startDate: course.startDate,
              endDate: course.endDate,
              media: course.media,
              updated_at: new Date()
            }
          });
          result.updated++;
        } else {
          // Add new course
          await UnifiedCourse.create({
            ...course,
            language: 'en', // Default language
            download_count: 0
          });
          result.added++;
        }
      } catch (error) {
        logger.error(`Failed to process course ${course.title}`, error);
        result.failed++;
      }
    }
  }

  /**
   * Map curriculum tags based on course attributes
   * This method can be expanded to use more sophisticated mapping logic
   */
  mapCurriculumTags(course: any): string[] {
    const tags: string[] = [];
    
    // Simple mapping rules - these would be more sophisticated in production
    if (course.type === 'secondary') {
      if (course.title.toLowerCase().includes('waec')) {
        tags.push('WAEC');
      }
      if (course.title.toLowerCase().includes('neco')) {
        tags.push('NECO');
      }
      // Default to NERDC for secondary courses without specific tags
      if (tags.length === 0) {
        tags.push('NERDC');
      }
    }
    
    return tags;
  }
}

export const courseSyncService = new CourseSyncService();
import mongoose, { Document, Schema } from 'mongoose';

// For tracking user attendance
export interface IUserAttendance extends Document {
  user_id: mongoose.Types.ObjectId;
  login_timestamp: Date;
  logout_timestamp?: Date;
  session_duration?: number; // in minutes
  ip_address: string;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  device_info: {
    browser?: string;
    os?: string;
    device_type?: 'mobile' | 'tablet' | 'desktop' | 'other';
  };
}

const UserAttendanceSchema: Schema<IUserAttendance> = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  login_timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  logout_timestamp: Date,
  session_duration: Number,
  ip_address: {
    type: String,
    required: true
  },
  geolocation: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  device_info: {
    browser: String,
    os: String,
    device_type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'other']
    }
  }
}, {
  timestamps: false
});

// For tracking learning outcomes
export interface ILearningOutcome extends Document {
  user_id: mongoose.Types.ObjectId;
  course_id: mongoose.Types.ObjectId;
  activity_date: Date;
  activity_type: 'quiz' | 'assignment' | 'exam';
  score: number;
  max_score: number;
  percentage: number;
  NERDC_competency_code?: string;
  curriculum_tag?: 'NERDC' | 'WAEC' | 'NECO';
  topic?: string;
  competency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

const LearningOutcomeSchema: Schema<ILearningOutcome> = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UnifiedCourse',
    required: true,
    index: true
  },
  activity_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  activity_type: {
    type: String,
    enum: ['quiz', 'assignment', 'exam'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  max_score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  NERDC_competency_code: String,
  curriculum_tag: {
    type: String,
    enum: ['NERDC', 'WAEC', 'NECO']
  },
  topic: String,
  competency_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  }
}, {
  timestamps: false
});

// For content engagement analytics
export interface IContentEngagement extends Document {
  content_id: mongoose.Types.ObjectId;
  content_type: 'course' | 'oer_resource';
  date: Date;
  views: number;
  downloads: number;
  completions: number;
  avg_rating: number;
  rating_count: number;
}

const ContentEngagementSchema: Schema<IContentEngagement> = new Schema({
  content_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'content_type',
    index: true
  },
  content_type: {
    type: String,
    required: true,
    enum: ['course', 'oer_resource']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  avg_rating: {
    type: Number,
    default: 0
  },
  rating_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: false
});

// Create indexes for efficient analytics queries
UserAttendanceSchema.index({ login_timestamp: -1 });
LearningOutcomeSchema.index({ activity_date: -1 });
ContentEngagementSchema.index({ date: -1 });
LearningOutcomeSchema.index({ NERDC_competency_code: 1 });
LearningOutcomeSchema.index({ curriculum_tag: 1 });

export const UserAttendance = mongoose.model<IUserAttendance>('UserAttendance', UserAttendanceSchema, 'user_attendance');
export const LearningOutcome = mongoose.model<ILearningOutcome>('LearningOutcome', LearningOutcomeSchema, 'learning_outcomes');
export const ContentEngagement = mongoose.model<IContentEngagement>('ContentEngagement', ContentEngagementSchema, 'content_engagement');
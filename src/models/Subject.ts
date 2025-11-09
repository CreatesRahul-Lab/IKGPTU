import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubject extends Document {
  _id: string;
  courseCode: string;
  courseTitle: string;
  courseType: 'Professional Core Courses' | 'Engineering Science Course' | 'Basic Science Course' | 
              'Humanities & Social Sciences Including Management Courses' | 'Open Elective Courses' | 
              'Professional Elective' | 'Professional Elective Courses' | 'Mandatory Courses' | 'Project';
  branch: 'BTCS' | 'BTAI' | 'BBA' | 'BCA';
  semester: number;
  credits?: number;
  internalMarks?: number;
  externalMarks?: number;
  totalMarks?: number;
  isLab: boolean;
  isElective: boolean;
  teacherId?: mongoose.Types.ObjectId;
  teacherName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      uppercase: true,
      trim: true,
    },
    courseTitle: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    courseType: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: ['BTCS', 'BTAI', 'BBA', 'BCA'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    credits: {
      type: Number,
      default: 4,
    },
    internalMarks: {
      type: Number,
      default: 40,
    },
    externalMarks: {
      type: Number,
      default: 60,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    isLab: {
      type: Boolean,
      default: false,
    },
    isElective: {
      type: Boolean,
      default: false,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    teacherName: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
SubjectSchema.index({ branch: 1, semester: 1 });
SubjectSchema.index({ courseCode: 1, branch: 1, semester: 1 }, { unique: true });
SubjectSchema.index({ teacherId: 1 }); // For fetching teacher's assigned subjects
SubjectSchema.index({ isElective: 1, branch: 1, semester: 1 }); // For elective queries
SubjectSchema.index({ courseTitle: 'text', courseCode: 'text' }); // Text search

const Subject: Model<ISubject> = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);

export default Subject;

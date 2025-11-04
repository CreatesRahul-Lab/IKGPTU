import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  password: string;
  rollNo: string;
  branch: 'BTCS' | 'BTAI' | 'BBA' | 'BCA';
  semester: number;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      uppercase: true,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: ['BTCS', 'BTAI', 'BBA', 'BCA'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ rollNo: 1 }, { unique: true });
studentSchema.index({ branch: 1, semester: 1 });

const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);

export default Student;

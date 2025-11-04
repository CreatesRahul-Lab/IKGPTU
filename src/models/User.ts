import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  
  // Student-specific fields
  rollNo?: string;
  branch?: 'BTCS' | 'BTAI' | 'BBA' | 'BCA';
  semester?: number;
  
  // Teacher-specific fields
  employeeId?: string;
  department?: string;
  
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
      index: true,
    },
    // Student fields
    rollNo: {
      type: String,
      sparse: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    branch: {
      type: String,
      enum: ['BTCS', 'BTAI', 'BBA', 'BCA'],
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    // Teacher fields
    employeeId: {
      type: String,
      sparse: true,
      unique: true,
    },
    department: {
      type: String,
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

// Compound index for student queries
UserSchema.index({ branch: 1, semester: 1, role: 1 });
UserSchema.index({ rollNo: 1, branch: 1 });

// Pre-save validation
UserSchema.pre('save', function (next: any) {
  if (this.role === 'student') {
    if (!this.rollNo || !this.branch || !this.semester) {
      return next(new Error('Roll number, branch, and semester are required for students'));
    }
  }
  if (this.role === 'teacher' && !this.employeeId) {
    return next(new Error('Employee ID is required for teachers'));
  }
  next();
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

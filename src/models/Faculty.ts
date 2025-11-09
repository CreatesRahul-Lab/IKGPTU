import mongoose, { Document, Schema } from 'mongoose';

export interface IFaculty extends Document {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const facultySchema = new Schema<IFaculty>(
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

// Indexes for optimized queries
facultySchema.index({ email: 1 }, { unique: true });
facultySchema.index({ isActive: 1, email: 1 }); // For active faculty queries
facultySchema.index({ name: 'text', email: 'text' }); // Text search

const Faculty = mongoose.models.Faculty || mongoose.model<IFaculty>('Faculty', facultySchema);

export default Faculty;

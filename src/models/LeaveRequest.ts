import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveRequest extends Document {
  _id: string;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  rollNo: string;
  branch: string;
  semester: number;
  leaveType: 'Medical' | 'Duty';
  startDate: Date;
  endDate: Date;
  reason: string;
  documentUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedByName?: string;
  reviewedAt?: Date;
  reviewComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    rollNo: {
      type: String,
      required: true,
      uppercase: true,
    },
    branch: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Medical', 'Duty'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    documentUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedByName: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    reviewComments: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
LeaveRequestSchema.index({ studentId: 1, status: 1, createdAt: -1 });
LeaveRequestSchema.index({ status: 1, createdAt: -1 });
LeaveRequestSchema.index({ branch: 1, semester: 1, status: 1 });

const LeaveRequest: Model<ILeaveRequest> = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;

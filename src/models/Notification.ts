import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'student' | 'teacher';
  type: 'subject_assigned' | 'attendance_marked' | 'marks_assigned' | 'leave_status' | 'general';
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId; // ID of related subject, attendance, etc.
  relatedModel?: string; // 'Subject', 'Attendance', etc.
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ['student', 'teacher'],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['subject_assigned', 'attendance_marked', 'marks_assigned', 'leave_status', 'general'],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    relatedModel: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, userType: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

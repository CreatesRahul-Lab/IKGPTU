import Notification from '@/models/Notification';
import connectDB from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export type NotificationType = 'subject_assigned' | 'attendance_marked' | 'marks_assigned' | 'leave_status' | 'general';
export type UserType = 'student' | 'teacher';

interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  userType: UserType;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string | mongoose.Types.ObjectId;
  relatedModel?: string;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      await connectDB();
      
      const notification = await Notification.create({
        userId: params.userId,
        userType: params.userType,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedId: params.relatedId,
        relatedModel: params.relatedModel,
        isRead: false,
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for subject assignment to teacher
   */
  static async notifySubjectAssignment(
    teacherId: string | mongoose.Types.ObjectId,
    subjectCode: string,
    subjectTitle: string,
    semester: number,
    branch: string
  ) {
    return this.createNotification({
      userId: teacherId,
      userType: 'teacher',
      type: 'subject_assigned',
      title: '📚 New Subject Assigned',
      message: `You have been assigned to teach ${subjectTitle} (${subjectCode}) for ${branch} Semester ${semester}`,
      relatedModel: 'Subject',
    });
  }

  /**
   * Create notification for attendance marking
   */
  static async notifyAttendanceMarked(
    studentId: string | mongoose.Types.ObjectId,
    subjectTitle: string,
    status: 'present' | 'absent',
    date: Date
  ) {
    const emoji = status === 'present' ? '✅' : '❌';
    const statusText = status === 'present' ? 'Present' : 'Absent';
    
    return this.createNotification({
      userId: studentId,
      userType: 'student',
      type: 'attendance_marked',
      title: `${emoji} Attendance Marked`,
      message: `Your attendance for ${subjectTitle} on ${date.toLocaleDateString()} has been marked as ${statusText}`,
      relatedModel: 'Attendance',
    });
  }

  /**
   * Create notification for marks assignment
   */
  static async notifyMarksAssigned(
    studentId: string | mongoose.Types.ObjectId,
    subjectTitle: string,
    marksObtained: number,
    totalMarks: number,
    examType: string
  ) {
    return this.createNotification({
      userId: studentId,
      userType: 'student',
      type: 'marks_assigned',
      title: '📊 New Marks Added',
      message: `Your ${examType} marks for ${subjectTitle} have been uploaded: ${marksObtained}/${totalMarks}`,
      relatedModel: 'Marks',
    });
  }

  /**
   * Create notification for leave request status
   */
  static async notifyLeaveStatus(
    studentId: string | mongoose.Types.ObjectId,
    status: 'approved' | 'rejected',
    reason: string
  ) {
    const emoji = status === 'approved' ? '✅' : '❌';
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';
    
    return this.createNotification({
      userId: studentId,
      userType: 'student',
      type: 'leave_status',
      title: `${emoji} Leave Request ${statusText}`,
      message: `Your leave request has been ${statusText.toLowerCase()}. Reason: ${reason}`,
      relatedModel: 'LeaveRequest',
    });
  }

  /**
   * Notify multiple users at once
   */
  static async notifyMultipleUsers(
    userIds: (string | mongoose.Types.ObjectId)[],
    userType: UserType,
    type: NotificationType,
    title: string,
    message: string
  ) {
    try {
      await connectDB();
      
      const notifications = userIds.map(userId => ({
        userId,
        userType,
        type,
        title,
        message,
        isRead: false,
      }));

      return await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Error creating multiple notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    try {
      await connectDB();
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string | mongoose.Types.ObjectId) {
    try {
      await connectDB();
      return await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string | mongoose.Types.ObjectId) {
    try {
      await connectDB();
      return await Notification.countDocuments({ userId, isRead: false });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Delete old notifications (older than 30 days)
   */
  static async cleanupOldNotifications() {
    try {
      await connectDB();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true,
      });
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }
}

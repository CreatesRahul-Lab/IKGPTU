# Notification System Documentation

## Overview
A comprehensive real-time notification system has been implemented for the IKGPTU project, allowing teachers and students to receive automatic notifications for important events.

## Features

### For Teachers
- **Subject Assignment Notifications**: Get notified when admin assigns a subject to you
- **Notification Format**: "📚 New Subject Assigned - You have been assigned to teach [Subject Name] ([Subject Code]) for [Branch] Semester [Semester]"

### For Students
- **Attendance Notifications**: Get notified when attendance is marked
  - Format: "✅ Attendance Marked - Your attendance for [Subject] on [Date] has been marked as Present"
  - Format: "❌ Attendance Marked - Your attendance for [Subject] on [Date] has been marked as Absent"

- **Marks Notifications**: Get notified when marks are uploaded
  - Format: "📊 New Marks Added - Your [Exam Type] marks for [Subject] have been uploaded: [Obtained]/[Total]"

- **Leave Status Notifications**: Get notified when leave request is approved/rejected
  - Format: "✅ Leave Request Approved - Your leave request has been approved. Reason: [Comments]"
  - Format: "❌ Leave Request Rejected - Your leave request has been rejected. Reason: [Comments]"

## Architecture

### Database Model
**Location**: `src/models/Notification.ts`

```typescript
interface INotification {
  userId: ObjectId;                    // User receiving the notification
  userType: 'student' | 'teacher';     // User role
  type: NotificationType;              // Notification category
  title: string;                       // Short title (with emoji)
  message: string;                     // Detailed message
  relatedId?: ObjectId;                // Optional reference to related entity
  relatedModel?: string;               // Model name of related entity
  isRead: boolean;                     // Read status
  createdAt: Date;                     // Timestamp
}
```

**Notification Types**:
- `subject_assigned`: Teacher gets subject assignment
- `attendance_marked`: Student attendance recorded
- `marks_assigned`: Student marks uploaded
- `leave_status`: Leave request approved/rejected
- `general`: General notifications

### Service Layer
**Location**: `src/lib/notifications/notification-service.ts`

**Key Methods**:
- `createNotification()`: Create a single notification
- `notifySubjectAssignment()`: Notify teacher of subject assignment
- `notifyAttendanceMarked()`: Notify student of attendance marking
- `notifyMarksAssigned()`: Notify student of marks upload
- `notifyLeaveStatus()`: Notify student of leave status change
- `notifyMultipleUsers()`: Bulk notification creation
- `markAsRead()`: Mark single notification as read
- `markAllAsRead()`: Mark all user notifications as read
- `getUnreadCount()`: Get count of unread notifications
- `cleanupOldNotifications()`: Delete notifications older than 30 days

### API Routes

#### GET `/api/notifications`
Fetch user's notifications with pagination
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `unreadOnly`: Filter only unread (true/false)
- **Response**:
```json
{
  "notifications": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 45,
    "totalPages": 3
  },
  "unreadCount": 12
}
```

#### POST `/api/notifications`
Create notification (Admin only)
- **Body**:
```json
{
  "userId": "string",
  "userType": "student" | "teacher",
  "type": "...",
  "title": "string",
  "message": "string",
  "relatedId": "string (optional)",
  "relatedModel": "string (optional)"
}
```

#### PATCH `/api/notifications`
Mark all notifications as read for current user
- **Response**:
```json
{
  "success": true,
  "modifiedCount": 5
}
```

#### PATCH `/api/notifications/[id]`
Mark specific notification as read
- **Response**:
```json
{
  "success": true,
  "notification": {...}
}
```

#### DELETE `/api/notifications/[id]`
Delete specific notification
- **Response**:
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

## UI Components

### NotificationCenter Component
**Location**: `src/components/NotificationCenter.tsx`

**Features**:
- Bell icon with unread count badge (red circle)
- Dropdown panel with notification list
- Auto-refresh every 30 seconds
- Mark individual notifications as read
- Mark all as read
- Delete notifications
- Relative time display (e.g., "5m ago", "2h ago", "3d ago")
- Visual distinction for unread notifications (blue background + dot)
- Load more pagination

**Usage**:
```tsx
<NotificationCenter userType="teacher" />
<NotificationCenter userType="student" />
```

### Integration Points

#### Teacher Dashboard
**Location**: `src/app/teacher/dashboard/page.tsx`
- NotificationCenter added to header, left of "Upload Marks" button
- Shows teacher-specific notifications (subject assignments)

#### Student Dashboard
**Location**: `src/app/student/dashboard/page.tsx`
- NotificationCenter added to header, left of user info
- Shows student-specific notifications (attendance, marks, leave status)

## Notification Triggers

### 1. Subject Assignment
**Location**: `src/app/api/admin/subjects/assign/route.ts`
**Trigger**: When admin assigns a subject to a teacher
**Notification**: Sent to the assigned teacher

### 2. Attendance Upload
**Location**: `src/app/api/attendance/upload/route.ts`
**Trigger**: When teacher uploads attendance for a class
**Notification**: Sent to all students in that class (present and absent)
**Note**: Uses `Promise.allSettled()` to handle failures gracefully

### 3. Marks Upload
**Location**: `src/app/api/marks/upload/route.ts`
**Trigger**: When teacher uploads marks (MST-1, MST-2, Assignment)
**Notification**: Sent to each student whose marks were uploaded

### 4. Leave Status Change
**Location**: `src/app/api/admin/leave/route.ts`
**Trigger**: When admin approves or rejects a leave request
**Notification**: Sent to the student who requested leave

## Technical Details

### Error Handling
All notification triggers use try-catch blocks to ensure that notification failures don't break the main functionality:
```typescript
try {
  await NotificationService.notifyAttendanceMarked(...);
} catch (notifError) {
  console.error('Error sending notification:', notifError);
  // Don't fail the request if notification fails
}
```

### Performance Considerations
1. **Async Operations**: Notifications are sent asynchronously after main operation completes
2. **Bulk Operations**: Uses `Promise.allSettled()` for multiple notifications
3. **Indexes**: MongoDB indexes on `userId` and `isRead` for fast queries
4. **Cleanup**: Old read notifications (30+ days) can be cleaned up periodically
5. **Auto-refresh**: Client polls every 30 seconds (can be upgraded to WebSockets/SSE)

### Database Indexes
```typescript
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });
```

## Testing Checklist

### Teacher Notifications
- [ ] Assign subject to teacher → Teacher receives notification
- [ ] Unread count updates in real-time
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Auto-refresh updates list

### Student Notifications
- [ ] Upload attendance → All students receive notification
- [ ] Upload marks → Student receives notification
- [ ] Approve leave request → Student receives notification
- [ ] Reject leave request → Student receives notification
- [ ] Multiple notifications display correctly
- [ ] Mark all as read works
- [ ] Pagination works (Load more)

### UI/UX
- [ ] Bell icon shows correct unread count
- [ ] Unread notifications have blue background + dot
- [ ] Read notifications appear gray
- [ ] Relative time displays correctly
- [ ] Dropdown closes on outside click
- [ ] Loading states work properly
- [ ] Empty state displays when no notifications
- [ ] Mobile responsive design

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket or Server-Sent Events (SSE) for instant notifications
2. **Push Notifications**: Add browser push notifications using Web Push API
3. **Email Digest**: Send daily/weekly email summaries of notifications
4. **Notification Preferences**: Let users choose which notifications to receive
5. **Notification Grouping**: Group similar notifications (e.g., "Attendance marked for 3 subjects")
6. **Sound Alerts**: Add optional sound for new notifications
7. **Rich Notifications**: Add images, action buttons, expandable content
8. **Notification History**: Archive old notifications instead of deletion
9. **Priority Levels**: Implement high/medium/low priority notifications
10. **Search & Filter**: Add search and advanced filtering in notification panel

## Troubleshooting

### Notifications Not Appearing
1. Check MongoDB connection
2. Verify user authentication (session)
3. Check browser console for errors
4. Verify API routes are working (check Network tab)

### Unread Count Incorrect
1. Check database indexes
2. Verify `isRead` field updates correctly
3. Clear browser cache and refresh

### Performance Issues
1. Check if auto-refresh interval is too short
2. Verify database indexes exist
3. Consider implementing pagination limits
4. Monitor MongoDB query performance

## Dependencies

- **MongoDB**: Database for storing notifications
- **Mongoose**: ODM for MongoDB
- **Next.js**: API routes and server-side rendering
- **NextAuth.js**: Authentication and session management
- **lucide-react**: Icons (Bell, X, Check, CheckCheck)
- **TailwindCSS**: Styling

## Maintenance

### Regular Tasks
1. **Cleanup Old Notifications**: Run cleanup job monthly
   ```typescript
   await NotificationService.cleanupOldNotifications();
   ```

2. **Monitor Database Size**: Check notification collection size
3. **Review Error Logs**: Check for failed notification attempts
4. **Performance Testing**: Monitor query performance under load

### Database Maintenance
```javascript
// Run in MongoDB shell or script
// Delete notifications older than 90 days
db.notifications.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  isRead: true
});

// Check collection size
db.notifications.stats();

// Rebuild indexes
db.notifications.reIndex();
```

## Security Considerations

1. **Authorization**: All API routes check user authentication
2. **User Isolation**: Users can only see their own notifications
3. **XSS Prevention**: All user input is sanitized
4. **Rate Limiting**: Consider adding rate limits to prevent spam
5. **Admin Only**: Creating manual notifications requires admin role

## Conclusion

The notification system provides a robust, user-friendly way to keep teachers and students informed about important events in the IKGPTU system. It's designed to be extensible, performant, and maintainable.

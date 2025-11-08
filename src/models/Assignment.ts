import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
      enum: ['BTCS', 'BTAI', 'BBA', 'BCA'],
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 10,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true,
        },
        studentName: String,
        rollNo: String,
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        obtainedMarks: {
          type: Number,
          min: 0,
        },
        feedback: String,
        isGraded: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
AssignmentSchema.index({ branch: 1, semester: 1 });
AssignmentSchema.index({ subject: 1 });
AssignmentSchema.index({ dueDate: 1 });

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);

export default Assignment;

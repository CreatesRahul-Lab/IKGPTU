import mongoose from 'mongoose';

const MarksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
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
    examType: {
      type: String,
      required: true,
      enum: ['MST-1', 'MST-2', 'Assignment'],
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 20, // Default for MST
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    uploadedByName: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    examDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
MarksSchema.index({ student: 1, subject: 1, examType: 1 });
MarksSchema.index({ branch: 1, semester: 1 });
MarksSchema.index({ subject: 1 });

const Marks = mongoose.models.Marks || mongoose.model('Marks', MarksSchema);

export default Marks;

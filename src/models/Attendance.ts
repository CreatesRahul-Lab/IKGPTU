import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceRecord {
  studentId: string;
  rollNo: string;
  name: string;
  status: 'P' | 'A' | 'L'; // Present, Absent, Leave
}

export interface IAttendance extends Document {
  _id: string;
  date: Date;
  subject: mongoose.Types.ObjectId;
  subjectCode: string;
  subjectName: string;
  branch: 'BTCS' | 'BTAI' | 'BBA' | 'BCA';
  semester: number;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedByName: string;
  records: IAttendanceRecord[];
  totalPresent: number;
  totalAbsent: number;
  totalStudents: number;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  studentId: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['P', 'A', 'L'],
    required: true,
  },
}, { _id: false });

const AttendanceSchema = new Schema<IAttendance>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      uppercase: true,
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
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedByName: {
      type: String,
      required: true,
    },
    records: [AttendanceRecordSchema],
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalAbsent: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    academicYear: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
AttendanceSchema.index({ date: 1, subject: 1, semester: 1, branch: 1 }, { unique: true });
AttendanceSchema.index({ 'records.studentId': 1, date: -1 });
AttendanceSchema.index({ branch: 1, semester: 1, date: -1 });
AttendanceSchema.index({ academicYear: 1, branch: 1, semester: 1 });

// Pre-save hook to calculate totals
AttendanceSchema.pre('save', function (next: any) {
  this.totalStudents = this.records.length;
  this.totalPresent = this.records.filter((r: any) => r.status === 'P').length;
  this.totalAbsent = this.records.filter((r: any) => r.status === 'A').length;
  next();
});

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;

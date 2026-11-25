import { Schema, Types, model } from 'mongoose';

interface Student {
  classId: Types.ObjectId;
  displayName: string;
  readingScore?: number;
  mathScore?: number;
  tags?: string[];
}

const studentSchema = new Schema<Student>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    readingScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    mathScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    tags: {
      type: [String],
      default: undefined,
    },
  },
  { timestamps: false }
);

export default model<Student>('Student', studentSchema);

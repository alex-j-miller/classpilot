import { Schema, Types, model } from 'mongoose';

interface Classroom {
  teacherId: Types.ObjectId;
  name: string;
  createdAt: Date;
}

const classroomSchema = new Schema<Classroom>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<Classroom>('Classroom', classroomSchema);

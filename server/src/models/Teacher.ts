import { Schema, model } from 'mongoose';

interface Teacher {
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const teacherSchema = new Schema<Teacher>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<Teacher>('Teacher', teacherSchema);

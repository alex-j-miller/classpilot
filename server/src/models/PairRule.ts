import { Schema, Types, model } from 'mongoose';

type RuleType = 'neverPair';

interface PairRule {
  classId: Types.ObjectId;
  studentA: Types.ObjectId;
  studentB: Types.ObjectId;
  ruleType: RuleType;
}

const pairRuleSchema = new Schema<PairRule>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    studentA: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentB: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    ruleType: {
      type: String,
      enum: ['neverPair'],
      default: 'neverPair',
      required: true,
    },
  },
  { timestamps: false }
);

pairRuleSchema.index({ classId: 1, studentA: 1, studentB: 1, ruleType: 1 }, { unique: true });

export default model<PairRule>('PairRule', pairRuleSchema);

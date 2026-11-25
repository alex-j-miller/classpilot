export interface Teacher {
  id: string
  email: string
}

export interface Classroom {
  _id: string
  name: string
  createdAt: string
}

export interface Student {
  _id: string
  classId: string
  displayName: string
  readingScore?: number
  mathScore?: number
  tags?: string[]
}

export interface PairRule {
  _id: string
  classId: string
  studentA: { _id: string; displayName: string } | string
  studentB: { _id: string; displayName: string } | string
  ruleType: 'neverPair'
}

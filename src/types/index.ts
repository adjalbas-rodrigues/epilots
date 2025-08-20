export type UserRole = 'admin' | 'operator' | 'moderator' | 'subscriber'
export type StudentStatus = 'liberado' | 'bloqueado'
export type QuizStatus = 'finished' | 'inProgress'
export type FeedbackBehaviour = 'after_each' | 'at_end'

export interface User {
  id: number
  role: UserRole
  name: string
  email: string
  password?: string
  password_token?: string
  password_token_created?: Date
  created: Date
  modified: Date
}

export interface Student {
  id: number
  name: string
  email: string
  password?: string
  password_token?: string
  password_token_created?: Date
  status: StudentStatus
  hash: string
  expires?: Date
  nickname?: string
  created: Date
  modified: Date
}

export interface Subject {
  id: number
  name: string
  short_name: string | null
  color: string | null
  text_color: string | null
  super_quest?: boolean
  topics?: Topic[]
}



export interface Matter {
  id: number
  name: string
  topics?: Topic[]
}

export interface QuestionBase {
  id: number
  name: string
  description?: string
}

export interface Topic {
  id: number
  name: string
  subject_id?: string
  matterId?: string
  // matter?: Matter
}


export interface Question {
  id: number
  subject_id: number
  subject?: Subject
  baseId?: string
  base?: QuestionBase
  statement: string
  title?: string
  bibliography?: string
  created: Date
  modified: Date
  answers?: Answer[]
}

export interface Answer {
  id: number
  question_id: number
  description: string
  isCorrect: boolean
  created: Date
  modified: Date
}

export interface Quiz {
  id: number
  name: string
  student_id: number
  student?: Student
  status: QuizStatus
  feedback_behaviour: FeedbackBehaviour
  superquest: boolean
  created: Date
  modified: Date
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  question_id: number
  quiz_id: number
  answer_id?: string
  position: number
  question?: Question
  answer?: Answer
}

export interface QuizFavorite {
  student_id: number
  question_id: number
  mark: boolean
  flag: boolean
  observacao?: string
  created: Date
  modified: Date
}

export interface StudentSubject {
  student_id: number
  subject_id: number
  inedited_questions: string
}

export interface QuizType {
  id: number
  name: string
  description: string
  value: string
}

export interface QuizStatistics {
  totalQuizzes: number
  correctAnswers: number
  wrongAnswers: number
  percentageCorrect: number
  quizzesPerDay: { date: string; count: number }[]
  performanceBySubject: { subject: string; correct: number; total: number }[]
}
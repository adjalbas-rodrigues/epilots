export type UserRole = 'admin' | 'operator' | 'moderator' | 'subscriber'
export type StudentStatus = 'liberado' | 'bloqueado'
export type QuizStatus = 'finished' | 'inProgress'
export type FeedbackBehaviour = 'after_each' | 'at_end'

export interface User {
  id: string
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
  id: string
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
  id: string
  name: string
  super_quest: boolean
  created: Date
  modified: Date
}

export interface Question {
  id: string
  subject_id: string
  subject?: Subject
  statement: string
  title?: string
  bibliography?: string
  created: Date
  modified: Date
  answers?: Answer[]
}

export interface Answer {
  id: string
  question_id: string
  description: string
  isCorrect: boolean
  created: Date
  modified: Date
}

export interface Quiz {
  id: string
  name: string
  student_id: string
  student?: Student
  status: QuizStatus
  feedback_behaviour: FeedbackBehaviour
  superquest: boolean
  created: Date
  modified: Date
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  question_id: string
  quiz_id: string
  answer_id?: string
  position: number
  question?: Question
  answer?: Answer
}

export interface QuizFavorite {
  student_id: string
  question_id: string
  mark: boolean
  flag: boolean
  observacao?: string
  created: Date
  modified: Date
}

export interface StudentSubject {
  student_id: string
  subject_id: string
  inedited_questions: string
}

export interface QuizType {
  id: string
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
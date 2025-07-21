import { User, Student, Subject, Question, Answer, Quiz, QuizType } from '@/types'

export const mockUsers: User[] = [
  {
    id: 'user-1',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@epilots.com',
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'user-2',
    role: 'operator',
    name: 'Operator User',
    email: 'operator@epilots.com',
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
]

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'João Silva',
    email: 'joao@example.com',
    status: 'liberado',
    hash: 'hash123',
    nickname: 'João',
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'student-2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    status: 'liberado',
    hash: 'hash456',
    nickname: 'Maria',
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
]

export const mockSubjects: Subject[] = [
  {
    id: 'subject-1',
    name: 'Navegação',
    super_quest: true,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'subject-2',
    name: 'Meteorologia',
    super_quest: true,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'subject-3',
    name: 'Regulamentos de Tráfego Marítimo',
    super_quest: true,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'subject-4',
    name: 'Conhecimentos de Embarcação',
    super_quest: false,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'subject-5',
    name: 'Comunicações',
    super_quest: true,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'subject-6',
    name: 'Manobra',
    super_quest: true,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
]

export const mockAnswers: Answer[] = [
  // Question 1 answers
  {
    id: 'answer-1-1',
    question_id: 'question-1',
    description: 'Dois apitos curtos',
    isCorrect: true,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'answer-1-2',
    question_id: 'question-1',
    description: 'Um apito curto',
    isCorrect: false,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'answer-1-3',
    question_id: 'question-1',
    description: 'Três apitos curtos',
    isCorrect: false,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'answer-1-4',
    question_id: 'question-1',
    description: 'Um apito longo seguido de dois curtos',
    isCorrect: false,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  // Question 2 answers
  {
    id: 'answer-2-1',
    question_id: 'question-2',
    description: 'Cumulonimbus',
    isCorrect: true,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'answer-2-2',
    question_id: 'question-2',
    description: 'Cirrus',
    isCorrect: false,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'answer-2-3',
    question_id: 'question-2',
    description: 'Stratus',
    isCorrect: false,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'answer-2-4',
    question_id: 'question-2',
    description: 'Cumulus',
    isCorrect: false,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
]

export const mockQuestions: Question[] = [
  {
    id: 'question-1',
    subject_id: 'subject-3',
    statement: 'Em águas restritas, qual é a sequência correta de apitos para indicar ultrapassagem por boreste?',
    title: 'Sinais Sonoros',
    bibliography: 'RIPEAM - Regulamento Internacional para Evitar Abalroamento no Mar',
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
    answers: mockAnswers.filter(a => a.question_id === 'question-1'),
  },
  {
    id: 'question-2',
    subject_id: 'subject-2',
    statement: 'Qual tipo de nuvem está associado a tempestades severas no mar?',
    title: 'Tipos de Nuvens',
    bibliography: 'Manual de Meteorologia Marítima',
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
    answers: mockAnswers.filter(a => a.question_id === 'question-2'),
  },
  {
    id: 'question-3',
    subject_id: 'subject-1',
    statement: 'Qual é a diferença entre rumo verdadeiro e rumo magnético?',
    title: 'Navegação Básica',
    bibliography: 'Manual de Navegação Marítima',
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
    answers: [],
  },
]

export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    name: 'Quiz de Navegação',
    student_id: 'student-1',
    status: 'finished',
    feedback_behaviour: 'after_each',
    superquest: false,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'quiz-2',
    name: 'Super Quest',
    student_id: 'student-1',
    status: 'inProgress',
    feedback_behaviour: 'at_end',
    superquest: true,
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
]

export const mockQuizTypes: QuizType[] = [
  {
    id: 'type-1',
    name: 'Questões Aleatórias',
    description: 'Seleciona questões aleatórias de todas as matérias',
    value: 'random',
  },
  {
    id: 'type-2',
    name: 'Questões Inéditas',
    description: 'Apenas questões que você nunca respondeu',
    value: 'inedited',
  },
  {
    id: 'type-3',
    name: 'Questões Erradas',
    description: 'Revise as questões que você errou',
    value: 'wrong',
  },
  {
    id: 'type-4',
    name: 'Questões Favoritas',
    description: 'Suas questões marcadas como favoritas',
    value: 'favorites',
  },
  {
    id: 'type-5',
    name: 'Questões Marcadas',
    description: 'Questões que você marcou para revisar',
    value: 'flagged',
  },
  {
    id: 'type-6',
    name: 'Questões Numéricas',
    description: 'Buscar questões por número específico',
    value: 'numeric',
  },
  {
    id: 'type-7',
    name: 'Super Quest',
    description: '70 questões aleatórias de todas as matérias',
    value: 'superquest',
  },
]

// Helper functions to simulate API calls
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getMockStudent = async (email: string): Promise<Student | null> => {
  await delay(500)
  return mockStudents.find(s => s.email === email) || null
}

export const getMockUser = async (email: string): Promise<User | null> => {
  await delay(500)
  return mockUsers.find(u => u.email === email) || null
}
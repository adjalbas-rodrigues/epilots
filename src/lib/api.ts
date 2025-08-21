const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  token?: string;
  [key: string]: any;
}

class ApiClient {
  private token: string | null = null;
  private tokenKey = 'auth_token';

  constructor() {
    // Token será carregado quando necessário
  }

  private getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(this.tokenKey);
    }
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      // Clear any legacy tokens
      localStorage.removeItem('token');
      localStorage.removeItem('student_token');
      localStorage.removeItem('admin_token');
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`🌐 ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log('📤 Request body:', JSON.parse(options.body as string));
    }
    console.log('🔑 Headers:', headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for CORS
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async loginStudent(email: string, password: string) {
    const response = await this.request<{ token: string; student: any }>('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('🔐 Login response:', response);
    
    if (response.token) {
      console.log('💾 Saving token to localStorage');
      this.setToken(response.token);
    } else {
      console.warn('⚠️ No token in response');
    }

    return response;
  }

  async loginAdmin(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async registerStudent(name: string, email: string, password: string) {
    const response = await this.request('/auth/student/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  // Subject endpoints
  async getSubjects() {
    return this.request<any[]>('/subjects');
  }

  async getSubjectWithTopics(subjectId: number) {
    return this.request(`/subjects/${subjectId}`);
  }

  // Matter endpoints
  async getMatters() {
    return this.request<any[]>('/matters');
  }

  async getMatterWithTopics(matterId: number) {
    return this.request(`/matters/${matterId}`);
  }

  // Quiz endpoints
  async createQuiz(
    questionCount: number, 
    topicIds: number[], 
    baseIds?: number[], 
    feedbackMode: 'immediate' | 'end' = 'immediate',
    onlyWrong: boolean = false,
    onlyMarked: boolean = false,
    name?: string,
    onlyInedited: boolean = false
  ) {
    return this.request<{ quizId: number; questionCount: number }>('/quizzes', {
      method: 'POST',
      body: JSON.stringify({ questionCount, topicIds, baseIds, feedbackMode, onlyWrong, onlyMarked, name, onlyInedited }),
    });
  }

  async getQuiz(quizId: number) {
    return this.request(`/quizzes/${quizId}`);
  }

  async submitAnswer(quizId: number, questionId: number, choiceId: number) {
    return this.request(`/quizzes/${quizId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, choice_id: choiceId }),
    });
  }

  async markQuestion(quizId: number, questionId: number, marked: boolean) {
    return this.request(`/quizzes/${quizId}/mark`, {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, marked }),
    });
  }

  async finishQuiz(quizId: number) {
    return this.request<{ score: number; correct: number; total: number }>(
      `/quizzes/${quizId}/finish`,
      {
        method: 'POST',
      }
    );
  }

  async getQuizFeedback(quizId: number) {
    return this.request(`/quizzes/${quizId}/feedback`);
  }

  async getQuestionFeedback(quizId: number, questionId: number) {
    return this.request(`/quizzes/${quizId}/question/${questionId}/feedback`);
  }

  async getQuizHistory(limit = 10, offset = 0) {
    return this.request(`/quizzes/history?limit=${limit}&offset=${offset}`);
  }

  async getReviewStats() {
    return this.request<{ wrongQuestions: number; markedQuestions: number }>('/quizzes/review-stats');
  }

  // Statistics endpoints
  async getStudentStatistics() {
    return this.request('/statistics/student');
  }

  async getSubjectStatistics(subjectId: number) {
    return this.request(`/statistics/subject/${subjectId}`);
  }

  // Student endpoints
  async getStudentProfile() {
    return this.request('/student/profile');
  }

  async updateStudentProfile(data: { name?: string; phone?: string; birth_date?: string }) {
    return this.request('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/student/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getStudents(page = 1, limit = 10, search?: string) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    return this.request(`/admin/students?${params}`);
  }

  async createStudent(data: { name: string; email: string; password: string; registration_number?: string }) {
    return this.request('/admin/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id: number, data: any) {
    return this.request(`/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: number) {
    return this.request(`/admin/students/${id}`, {
      method: 'DELETE',
    });
  }

  async getQuestions(page = 1, limit = 10, subjectId?: number, search?: string, baseId?: number) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (subjectId) params.append('subject_id', subjectId.toString());
    if (search) params.append('search', search);
    if (baseId) params.append('baseId', baseId.toString());
    return this.request(`/admin/questions?${params}`);
  }

  async getQuestionBases() {
    return this.request('/question-bases');
  }

  async getQuestionCount(topicIds: number[], baseIds: number[], statementText?: string) {
    return this.request<{ count: number; filters: any }>('/question-count/count', {
      method: 'POST',
      body: JSON.stringify({ topicIds, baseIds, statementText }),
    });
  }

  async createQuestion(data: any) {
    return this.request('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestion(id: number, data: any) {
    return this.request(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestion(id: number) {
    return this.request(`/admin/questions/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
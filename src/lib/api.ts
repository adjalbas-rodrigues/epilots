const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  token?: string;
  [key: string]: any;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Recuperar token do localStorage se existir
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

    if (response.token) {
      this.setToken(response.token);
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

  // Quiz endpoints
  async createQuiz(subjectId: number, questionCount: number, topicIds?: number[]) {
    return this.request<{ quizId: number; questionCount: number }>('/quizzes', {
      method: 'POST',
      body: JSON.stringify({ subjectId, questionCount, topicIds }),
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

  async getQuizHistory(limit = 10, offset = 0) {
    return this.request(`/quizzes/history?limit=${limit}&offset=${offset}`);
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

  async getQuestions(page = 1, limit = 10, subjectId?: number, search?: string) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (subjectId) params.append('subject_id', subjectId.toString());
    if (search) params.append('search', search);
    return this.request(`/admin/questions?${params}`);
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
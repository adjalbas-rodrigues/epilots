import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  token?: string;
  [key: string]: any;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
  constructor(message: string, opts: { status?: number; code?: string; data?: any } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.data = opts.data;
  }
}

class ApiClient {
  private token: string | null = null;
  private tokenKey = 'auth_token';
  private axiosInstance: AxiosInstance;

  constructor() {
    // Token será carregado quando necessário
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for CORS
    });

    // Request interceptor para adicionar token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
          console.log('📤 Request body:', config.data);
        }
        console.log('🔑 Headers:', config.headers);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para tratamento de erros
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
        console.log('📦 Response data:', response.data);
        return response;
      },
      (error: AxiosError<ApiResponse>) => {
        console.error('❌ API Error:', error);
        const status = error.response?.status;
        const data: any = error.response?.data;

        // Se receber 401, limpar token e redirecionar pra login adequado
        if (status === 401) {
          console.log('🔒 Unauthorized - clearing token and redirecting to login');
          this.clearToken();
          if (typeof window !== 'undefined') {
            const isAdminPath = window.location.pathname.startsWith('/admin');
            window.location.href = isAdminPath ? '/admin/auth/login' : '/auth/login';
          }
        }

        const message = data?.message || error.message || 'API request failed';
        return Promise.reject(new ApiError(message, {
          status,
          code: data?.code,
          data
        }));
      }
    );
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
      localStorage.removeItem('persist:root');
    }
  }

  async request<T = any>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance({
        url: endpoint,
        ...options,
      });
      return response.data;
    } catch (error) {
      // Erro já tratado pelo interceptor
      throw error;
    }
  }

  // Auth endpoints
  async loginStudent(email: string, password: string) {
    const response = await this.request<{ token: string; student: any }>('/auth/student/login', {
      method: 'POST',
      data: { email, password },
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
      data: { email, password },
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async registerStudent(name: string, email: string, password: string) {
    const response = await this.request('/auth/student/register', {
      method: 'POST',
      data: { name, email, password },
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
      data: { questionCount, topicIds, baseIds, feedbackMode, onlyWrong, onlyMarked, name, onlyInedited },
    });
  }

  async getQuiz(quizId: number) {
    return this.request(`/quizzes/${quizId}`);
  }

  async submitAnswer(quizId: number, questionId: number, choiceId: number) {
    return this.request(`/quizzes/${quizId}/answer`, {
      method: 'POST',
      data: { question_id: questionId, choice_id: choiceId },
    });
  }

  async markQuestion(quizId: number, questionId: number, marked: boolean) {
    return this.request(`/quizzes/${quizId}/mark`, {
      method: 'POST',
      data: { question_id: questionId, marked },
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

  async deleteQuiz(quizId: number) {
    return this.request(`/quizzes/${quizId}`, {
      method: 'DELETE'
    });
  }

  async reportQuestionError(quizId: number, questionId: number, errorDescription: string) {
    return this.request(`/quizzes/${quizId}/report-error`, {
      method: 'POST',
      data: { questionId, errorDescription }
    });
  }

  async getReviewStats() {
    return this.request<{ wrongQuestions: number; markedQuestions: number }>('/quizzes/review-stats');
  }

  // Statistics endpoints
  async getStudentStatistics() {
    return this.request('/statistics/student');
  }

  // Subscription (student-side)
  async getMySubscription() {
    return this.request('/student/subscription');
  }

  // Payments (student-side)
  async getPlans() {
    return this.request('/payments/plans');
  }

  async createPixCharge(plan: string, couponCode?: string | null) {
    return this.request('/payments/charge', {
      method: 'POST',
      data: { plan, coupon_code: couponCode || undefined },
    });
  }

  async createPixSubscription(plan: string) {
    return this.request('/payments/subscribe', {
      method: 'POST',
      data: { plan },
    });
  }

  async getPaymentStatus(correlationId: string) {
    return this.request(`/payments/status/${correlationId}`);
  }

  async getMyPayments() {
    return this.request('/payments/me');
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
      data: data,
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/student/password', {
      method: 'PUT',
      data: { current_password: currentPassword, new_password: newPassword },
    });
  }

  // Video Lessons endpoints
  async getVideoLessons(params?: URLSearchParams) {
    const queryString = params ? `?${params.toString()}` : '';
    return this.request(`/videos/lessons/all${queryString}`);
  }

  async getFeaturedLessons() {
    return this.request('/videos/lessons/featured');
  }

  async getVideoLesson(id: string) {
    return this.request(`/videos/lessons/${id}`);
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
      data: data,
    });
  }

  async updateStudent(id: number, data: any) {
    return this.request(`/admin/students/${id}`, {
      method: 'PUT',
      data: data,
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
      data: { topicIds, baseIds, statementText },
    });
  }

  async createQuestion(data: any) {
    return this.request('/admin/questions', {
      method: 'POST',
      data: data,
    });
  }

  async updateQuestion(id: number, data: any) {
    return this.request(`/admin/questions/${id}`, {
      method: 'PUT',
      data: data,
    });
  }

  async deleteQuestion(id: number) {
    return this.request(`/admin/questions/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscription endpoints (admin)
  async getSubscriptions(params?: { page?: number; limit?: number; search?: string; status?: string; plan?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.plan) query.append('plan', params.plan);
    const qs = query.toString();
    return this.request(`/admin/subscriptions${qs ? `?${qs}` : ''}`);
  }

  async getSubscriptionStats() {
    return this.request('/admin/subscriptions/stats');
  }

  async getStudentSubscriptions(studentId: number) {
    return this.request(`/admin/subscriptions/student/${studentId}`);
  }

  async createSubscription(data: {
    student_id: number;
    plan?: string;
    amount?: number;
    payment_method?: string;
    start_date?: string;
    end_date?: string;
    auto_renew?: boolean;
    notes?: string;
  }) {
    return this.request('/admin/subscriptions', {
      method: 'POST',
      data,
    });
  }

  async updateSubscription(id: number, data: any) {
    return this.request(`/admin/subscriptions/${id}`, {
      method: 'PUT',
      data,
    });
  }

  async renewSubscription(id: number, data?: { plan?: string; amount?: number; payment_method?: string }) {
    return this.request(`/admin/subscriptions/${id}/renew`, {
      method: 'POST',
      data: data || {},
    });
  }

  async cancelSubscription(id: number) {
    return this.request(`/admin/subscriptions/${id}/cancel`, {
      method: 'POST',
    });
  }

  async deleteSubscription(id: number) {
    return this.request(`/admin/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  // Users (admin)
  async getUsers() {
    return this.request('/admin/users');
  }

  async createUser(data: { name: string; email: string; password: string; role: string }) {
    return this.request('/admin/users', { method: 'POST', data });
  }

  // Subjects (admin)
  async getAdminSubjects() {
    return this.request('/admin/subjects');
  }

  async createSubject(data: { name: string; short_name?: string; color?: string; text_color?: string }) {
    return this.request('/admin/subjects', { method: 'POST', data });
  }

  async updateSubject(id: number, data: any) {
    return this.request(`/admin/subjects/${id}`, { method: 'PUT', data });
  }

  async createTopic(subjectId: number, name: string) {
    return this.request(`/admin/subjects/${subjectId}/topics`, {
      method: 'POST',
      data: { name }
    });
  }

  async updateTopic(id: number, name: string) {
    return this.request(`/admin/topics/${id}`, { method: 'PUT', data: { name } });
  }

  async deleteTopic(id: number) {
    return this.request(`/admin/topics/${id}`, { method: 'DELETE' });
  }

  // Payment admin
  async getAdminPayments(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString();
    return this.request(`/admin/payments${qs ? `?${qs}` : ''}`);
  }

  async approvePayment(id: number) {
    return this.request(`/admin/payments/${id}/approve`, { method: 'POST' });
  }

  async createManualPayment(data: {
    student_id: number;
    plan: string;
    amount_cents: number;
    payment_method?: string;
    notes?: string;
    start_date?: string;
    end_date?: string;
  }) {
    return this.request('/admin/payments', { method: 'POST', data });
  }

  // Plans (admin)
  async getPlansAdmin() {
    return this.request('/admin/plans');
  }

  async createPlan(data: any) {
    return this.request('/admin/plans', { method: 'POST', data });
  }

  async updatePlan(id: number, data: any) {
    return this.request(`/admin/plans/${id}`, { method: 'PUT', data });
  }

  async deletePlan(id: number) {
    return this.request(`/admin/plans/${id}`, { method: 'DELETE' });
  }

  async togglePlan(id: number) {
    return this.request(`/admin/plans/${id}/toggle`, { method: 'POST' });
  }

  // Coupons (admin)
  async getCoupons() {
    return this.request('/admin/coupons');
  }

  async createCoupon(data: {
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    max_uses?: number | null;
    valid_from?: string | null;
    valid_until?: string | null;
    is_active?: boolean;
    student_id?: number | null;
  }) {
    return this.request('/admin/coupons', { method: 'POST', data });
  }

  async updateCoupon(id: number, data: any) {
    return this.request(`/admin/coupons/${id}`, { method: 'PUT', data });
  }

  async deleteCoupon(id: number) {
    return this.request(`/admin/coupons/${id}`, { method: 'DELETE' });
  }

  async toggleCoupon(id: number) {
    return this.request(`/admin/coupons/${id}/toggle`, { method: 'POST' });
  }

  // Coupons (student)
  async validateCoupon(code: string, plan: string) {
    return this.request('/payments/coupon/validate', {
      method: 'POST',
      data: { code, plan },
    });
  }

  async getMyPersonalCoupon() {
    return this.request('/payments/coupon/mine');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
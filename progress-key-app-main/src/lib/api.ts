// API service layer for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const user = sessionStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{ message: string; token: string; role: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return response;
  },
};

// Admin API
export const adminAPI = {
  getClasses: () => apiRequest('/admin/classes'),
  getSections: () => apiRequest('/admin/sections'),
  getSubjects: () => apiRequest('/admin/subjects'),
  getTeachers: () => apiRequest('/admin/teachers'),
  createTeacher: (data: any) => apiRequest('/admin/teachers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTeacher: (teacherId: string, data: any) => apiRequest(`/admin/teachers/${teacherId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getTeacherMappings: () => apiRequest('/admin/teacher-mappings'),
  createTeacherMapping: (data: any) => apiRequest('/admin/teacher-mappings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteTeacherMapping: (mappingId: string) => apiRequest(`/admin/teacher-mappings/${mappingId}`, {
    method: 'DELETE',
  }),
  getStudents: () => apiRequest('/admin/students'),
  getAttendanceAnalytics: () => apiRequest('/admin/analytics/attendance'),
  getMarksAnalytics: () => apiRequest('/admin/analytics/marks'),
  getBehaviourAnalytics: () => apiRequest('/admin/analytics/behaviour'),
  getFeesAnalytics: () => apiRequest('/admin/analytics/fees'),
};

// Attendance API
export const attendanceAPI = {
  markAttendance: (data: any) => apiRequest('/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAttendance: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/attendance${queryString}`);
  },
};

// Homework API
export const homeworkAPI = {
  getHomework: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/homework${queryString}`);
  },
  createHomework: (data: any) => apiRequest('/homework', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateHomework: (id: string, data: any) => apiRequest(`/homework/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteHomework: (id: string) => apiRequest(`/homework/${id}`, {
    method: 'DELETE',
  }),
};

// Materials API
export const materialsAPI = {
  getMaterials: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/materials${queryString}`);
  },
  createMaterial: (data: any) => apiRequest('/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateMaterial: (id: string, data: any) => apiRequest(`/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteMaterial: (id: string) => apiRequest(`/materials/${id}`, {
    method: 'DELETE',
  }),
};

// Marks API
export const marksAPI = {
  getMarks: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/marks${queryString}`);
  },
  createMark: (data: any) => apiRequest('/marks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateMark: (id: string, data: any) => apiRequest(`/marks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Announcements API
export const announcementsAPI = {
  getAnnouncements: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/announcements${queryString}`);
  },
  createAnnouncement: (data: any) => apiRequest('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAnnouncement: (id: string, data: any) => apiRequest(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAnnouncement: (id: string) => apiRequest(`/announcements/${id}`, {
    method: 'DELETE',
  }),
};

// Fees API
export const feesAPI = {
  getFees: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/fees${queryString}`);
  },
  createFee: (data: any) => apiRequest('/fees', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateFee: (id: string, data: any) => apiRequest(`/fees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Class Teacher API
export const classTeacherAPI = {
  getClassStudents: (classId?: string) => {
    const queryString = classId ? `?class_id=${classId}` : '';
    return apiRequest(`/class-teacher/students${queryString}`);
  },
  getClassAttendance: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/class-teacher/attendance${queryString}`);
  },
  getLeaveRequests: () => apiRequest('/class-teacher/leave-requests'),
  updateLeaveRequest: (id: string, data: any) => apiRequest(`/class-teacher/leave-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Subject Teacher API
export const subjectTeacherAPI = {
  getAssignedSubjects: () => apiRequest('/subject-teacher/subjects'),
  getClassStudents: (classId: string, subjectId: string) => 
    apiRequest(`/subject-teacher/students?class_id=${classId}&subject_id=${subjectId}`),
};

// Parent/Student API
export const parentAPI = {
  getStudentProfile: (studentId?: string) => {
    const queryString = studentId ? `?student_id=${studentId}` : '';
    return apiRequest(`/parent/profile${queryString}`);
  },
  getStudentAttendance: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/parent/attendance${queryString}`);
  },
  getStudentMarks: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/parent/marks${queryString}`);
  },
  getStudentHomework: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/parent/homework${queryString}`);
  },
};


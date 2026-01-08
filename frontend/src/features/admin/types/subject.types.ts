export interface Subject {
  id: string;
  name: string;
  class?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    fullName: string;
  };
}

export interface CreateSubjectDto {
  name: string;
  classId: string;
  teacherId?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  classId?: string;
  teacherId?: string;
}

export interface SubjectFilters {
  classId?: string;
  teacherId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SubjectResponse {
  data: Subject[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

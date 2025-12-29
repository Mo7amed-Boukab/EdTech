export interface Teacher {
    id: string;
    fullName: string;
    email: string;
    role: 'TEACHER';
    createdAt: string;
    class?: {
        id: string;
        name: string;
    };
}

export interface CreateTeacherDto {
    fullName: string;
    email: string;
    password?: string;
    role: 'TEACHER';
}

export interface UpdateTeacherDto {
    fullName?: string;
    email?: string;
    password?: string;
}

export interface TeacherFilters {
    classId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface TeacherResponse {
    data: Teacher[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

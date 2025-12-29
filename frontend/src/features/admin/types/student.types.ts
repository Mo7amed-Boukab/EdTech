export interface Student {
    id: string;
    fullName: string;
    email: string;
    role: 'STUDENT';
    createdAt: string;
    class?: {
        id: string;
        name: string;
    };
}

export interface CreateStudentDto {
    fullName: string;
    email: string;
    password?: string;
    role: 'STUDENT';
    classId?: string;
}

export interface UpdateStudentDto {
    fullName?: string;
    email?: string;
    password?: string;
    classId?: string;
}

export interface StudentFilters {
    classId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface StudentResponse {
    data: Student[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

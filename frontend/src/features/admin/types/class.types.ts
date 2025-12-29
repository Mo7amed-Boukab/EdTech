export interface Class {
    id: string;
    name: string;
    level?: string;
    academicYear?: string;
    createdAt: string;
    teacher?: {
        id: string;
        fullName: string;
        email: string;
    };
    _count?: {
        students: number;
    };
}

export interface CreateClassDto {
    name: string;
    level?: string;
    academicYear?: string;
    teacherId?: string;
}

export interface UpdateClassDto {
    name?: string;
    level?: string;
    academicYear?: string;
    teacherId?: string;
}

export interface ClassFilters {
    teacherId?: string;
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ClassResponse {
    data: Class[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

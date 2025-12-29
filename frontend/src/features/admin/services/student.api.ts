import { api } from '../../../api/axios';
import type { Student, CreateStudentDto, UpdateStudentDto, StudentFilters, StudentResponse } from '../types/student.types';

const BASE_PATH = '/users';

export const studentApi = {
    /**
     * Get all students with optional filters and pagination
     */
    async getAll(filters?: StudentFilters): Promise<StudentResponse> {
        const params = new URLSearchParams();

        // Always filter by STUDENT role
        params.append('role', 'STUDENT');

        if (filters?.classId) params.append('classId', filters.classId);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<any>(`${BASE_PATH}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Create a new student
     */
    async create(data: CreateStudentDto): Promise<Student> {
        const response = await api.post<any>(BASE_PATH, {
            ...data,
            role: 'STUDENT'
        });
        return response.data.data;
    },

    /**
     * Update an existing student
     */
    async update(id: string, data: UpdateStudentDto): Promise<Student> {
        const response = await api.put<any>(`${BASE_PATH}/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete a student
     */
    async delete(id: string): Promise<void> {
        await api.delete(`${BASE_PATH}/${id}`);
    },

    /**
     * Assign a student to a class
     */
    async assignToClass(studentId: string, classId: string): Promise<Student> {
        const response = await api.put<any>(`${BASE_PATH}/${studentId}/assign-class`, { classId });
        return response.data.data;
    }
};

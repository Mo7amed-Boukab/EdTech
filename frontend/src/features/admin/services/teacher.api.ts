import { api } from '../../../api/axios';
import type { Teacher, CreateTeacherDto, UpdateTeacherDto, TeacherFilters, TeacherResponse } from '../types/teacher.types';

const BASE_PATH = '/users';

export const teacherApi = {
    /**
     * Get all teachers with optional filters and pagination
     */
    async getAll(filters?: TeacherFilters): Promise<TeacherResponse> {
        const params = new URLSearchParams();

        // Always filter by TEACHER role
        params.append('role', 'TEACHER');

        if (filters?.classId) params.append('classId', filters.classId);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<any>(`${BASE_PATH}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Create a new teacher
     */
    async create(data: CreateTeacherDto): Promise<Teacher> {
        const response = await api.post<any>(BASE_PATH, {
            ...data,
            role: 'TEACHER'
        });
        return response.data.data;
    },

    /**
     * Update an existing teacher
     */
    async update(id: string, data: UpdateTeacherDto): Promise<Teacher> {
        const response = await api.put<any>(`${BASE_PATH}/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete a teacher
     */
    async delete(id: string): Promise<void> {
        await api.delete(`${BASE_PATH}/${id}`);
    }
};

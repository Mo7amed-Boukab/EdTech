import { api } from '../../../api/axios';
import type { Class, CreateClassDto, UpdateClassDto, ClassFilters, ClassResponse } from '../types/class.types';

const BASE_PATH = '/classes';

export const classApi = {
    /**
     * Get all classes with optional filters and pagination
     */
    async getAll(filters?: ClassFilters): Promise<ClassResponse> {
        const params = new URLSearchParams();

        if (filters?.teacherId) params.append('teacherId', filters.teacherId);
        if (filters?.level) params.append('level', filters.level);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<any>(`${BASE_PATH}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get a single class by ID
     */
    async getById(id: string): Promise<Class> {
        const response = await api.get<any>(`${BASE_PATH}/${id}`);
        return response.data.data;
    },

    /**
     * Create a new class
     */
    async create(data: CreateClassDto): Promise<Class> {
        const response = await api.post<any>(BASE_PATH, data);
        return response.data.data;
    },

    /**
     * Update an existing class
     */
    async update(id: string, data: UpdateClassDto): Promise<Class> {
        const response = await api.put<any>(`${BASE_PATH}/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete a class
     */
    async delete(id: string): Promise<void> {
        await api.delete(`${BASE_PATH}/${id}`);
    },

    /**
     * Assign a teacher to a class
     */
    async assignTeacher(classId: string, teacherId: string): Promise<Class> {
        const response = await api.put<any>(`${BASE_PATH}/${classId}/assign-teacher`, { teacherId });
        return response.data.data;
    }
};

import { api } from '../../../api/axios';
import type { Subject, CreateSubjectDto, UpdateSubjectDto, SubjectFilters, SubjectResponse } from '../types/subject.types';

const BASE_PATH = '/subjects';

export const subjectApi = {
    /**
     * Get all subjects with optional filters and pagination
     */
    async getAll(filters?: SubjectFilters): Promise<SubjectResponse> {
        const params = new URLSearchParams();

        if (filters?.classId) params.append('classId', filters.classId);
        if (filters?.teacherId) params.append('teacherId', filters.teacherId);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<any>(`${BASE_PATH}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get a single subject by ID
     */
    async getById(id: string): Promise<Subject> {
        const response = await api.get<any>(`${BASE_PATH}/${id}`);
        return response.data.data;
    },

    /**
     * Create a new subject
     */
    async create(data: CreateSubjectDto): Promise<Subject> {
        const response = await api.post<any>(BASE_PATH, data);
        return response.data.data;
    },

    /**
     * Update an existing subject
     */
    async update(id: string, data: UpdateSubjectDto): Promise<Subject> {
        const response = await api.put<any>(`${BASE_PATH}/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete a subject
     */
    async delete(id: string): Promise<void> {
        await api.delete(`${BASE_PATH}/${id}`);
    }
};

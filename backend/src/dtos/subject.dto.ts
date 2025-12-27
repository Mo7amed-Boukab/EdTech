export interface CreateSubjectDto {
    name: string;
    classId?: string;
    teacherId?: string;
}

export interface UpdateSubjectDto {
    name?: string;
    classId?: string;
    teacherId?: string;
}

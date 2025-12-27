export interface CreateSessionDto {
    date: string;
    classId: string;
    subjectId: string;
    teacherId?: string;
}

export interface UpdateSessionDto {
    date?: string;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
}

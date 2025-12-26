export interface CreateClassDto {
    name: string;
    teacherId?: string; // Optional at creation
}

export interface UpdateClassDto {
    name?: string;
    teacherId?: string;
}

export interface AssignTeacherDto {
    teacherId: string;
}

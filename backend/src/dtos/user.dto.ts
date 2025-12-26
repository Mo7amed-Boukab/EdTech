import { Role } from "../types/user";

export interface CreateUserDto {
    fullName: string;
    email: string;
    password?: string; 
    role: Role;
    classId?: string; 
}

export interface AssignClassDto {
    classId: string;
}

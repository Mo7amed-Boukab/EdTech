import { AttendanceStatus } from '../generated/prisma/client';

export interface AttendanceRecordDto {
    studentId: string;
    status: AttendanceStatus;
}

export interface MarkAttendanceDto {
    records: AttendanceRecordDto[];
}

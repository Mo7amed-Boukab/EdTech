import { api } from "../../../api/axios";

export interface StudentAttendanceRecord {
    id: string;
    date: string;
    time: string;
    subject: string;
    teacher: string;
    room: string;
    status: "PRESENT" | "ABSENT" | "LATE" | null;
    justified: boolean | null;
}

export interface StudentDashboardStats {
    attendanceData: {
        present: number;
        absent: number;
        late: number;
        total: number;
    };
    absenceData: Record<number, { id: string, subject: string, justified: boolean }[]>;
    todaySchedule: {
        time: string;
        subject: string;
        teacher: string;
        room: string;
        status: string;
    }[];
}

export const studentService = {
    async getAttendanceHistory(): Promise<StudentAttendanceRecord[]> {
        const response = await api.get<{ data: StudentAttendanceRecord[] }>('/attendance/student/history');
        return response.data.data;
    },

    async getDashboardStats(): Promise<StudentDashboardStats> {
        const response = await api.get<{ data: StudentDashboardStats }>('/stats/student-dashboard');
        return response.data.data;
    },

    async getSchedule(startDate: Date, endDate: Date): Promise<any[]> {
        const response = await api.get<{ data: any[] }>(`/attendance/student/sessions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        return response.data.data;
    }
};

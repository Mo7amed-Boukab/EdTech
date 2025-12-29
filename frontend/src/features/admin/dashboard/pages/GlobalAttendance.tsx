import { useState } from 'react';
import { Header } from '../../../../components/Header';
import { Download, UserCheck, UserX, Clock } from 'lucide-react';
import { CustomSelect } from '../../../../components/CustomSelect';

// Mock Data for Attendance
const MOCK_ATTENDANCE = [
    {
        id: 1,
        date: "2023-12-29",
        time: "08:00 - 10:00",
        class: "Terminale S1",
        subject: "Mathématiques",
        teacher: "Jean Dupont",
        present: 22,
        absent: 2,
        late: 0,
        status: "Completed"
    },
    {
        id: 2,
        date: "2023-12-29",
        time: "10:00 - 12:00",
        class: "1ère S2",
        subject: "Physique-Chimie",
        teacher: "Sarah Martin",
        present: 26,
        absent: 1,
        late: 1,
        status: "Completed"
    },
    {
        id: 3,
        date: "2023-12-29",
        time: "14:00 - 16:00",
        class: "Seconde 3",
        subject: "Français",
        teacher: "Michel Dubois",
        present: 28,
        absent: 2,
        late: 0,
        status: "In Progress"
    },
    {
        id: 4,
        date: "2023-12-28",
        time: "08:00 - 10:00",
        class: "Terminale S1",
        subject: "Anglais",
        teacher: "Sophie Richard",
        present: 24,
        absent: 0,
        late: 0,
        status: "Completed"
    }
];

export const GlobalAttendance = () => {
    const [dateFilter, setDateFilter] = useState("Today");
    const [classFilter, setClassFilter] = useState("All");
    const [subjectFilter, setSubjectFilter] = useState("All");

    return (
        <div className="animate-in fade-in duration-500">
            <Header
                title="Présence Globale"
                description="Suivi de l'assiduité par classe, matière et session"
            />
            <div className="px-6 pb-6 space-y-6 mt-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Taux de présence (Auj.)</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">94.5%</h3>
                        </div>
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded flex items-center justify-center">
                            <UserCheck size={20} />
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Absences (Auj.)</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">12</h3>
                        </div>
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded flex items-center justify-center">
                            <UserX size={20} />
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Retards (Auj.)</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">5</h3>
                        </div>
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 rounded border border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="w-full sm:w-[200px]">
                            <CustomSelect
                                value={dateFilter}
                                onChange={setDateFilter}
                                options={[
                                    { value: 'Today', label: "Aujourd'hui" },
                                    { value: 'Week', label: "Cette semaine" },
                                    { value: 'Month', label: "Ce mois" }
                                ]}
                                placeholder="Période"
                            />
                        </div>
                        <div className="w-full sm:w-[200px]">
                            <CustomSelect
                                value={classFilter}
                                onChange={setClassFilter}
                                options={['All', 'Terminale S1', '1ère S2', 'Seconde 3']}
                                placeholder="Toutes les classes"
                            />
                        </div>
                        <div className="w-full sm:w-[200px]">
                            <CustomSelect
                                value={subjectFilter}
                                onChange={setSubjectFilter}
                                options={['All', 'Mathématiques', 'Physique-Chimie', 'Français', 'Anglais']}
                                placeholder="Toutes les matières"
                            />
                        </div>
                    </div>
                    <div>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                            <Download size={16} />
                            <span>Exporter</span>
                        </button>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Heure</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classe</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Matière</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enseignant</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Présents</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Absents</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {MOCK_ATTENDANCE.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{session.date}</span>
                                                <span className="text-xs text-gray-500">{session.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{session.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{session.subject}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.teacher}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {session.present}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.absent > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {session.absent}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${session.status === 'Completed'
                                                ? 'bg-teal-50 text-teal-700'
                                                : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                {session.status === 'Completed' ? 'Terminé' : 'En cours'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

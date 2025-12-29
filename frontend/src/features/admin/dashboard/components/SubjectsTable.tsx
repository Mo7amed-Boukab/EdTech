import { Edit2, Trash2, BookOpen, User, GraduationCap } from "lucide-react";

interface Subject {
    id: number;
    name: string;
    code: string;
    coefficient: number;
    description: string;
    className?: string;
    teacher?: string;
    studentCount?: number;
}

interface SubjectsTableProps {
    subjects: Subject[];
    onEdit: (subject: Subject) => void;
    onDelete: (subject: Subject) => void;
}

export const SubjectsTable = ({ subjects, onEdit, onDelete }: SubjectsTableProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Matière</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classe</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enseignant</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {subjects.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    Aucune matière trouvée
                                </td>
                            </tr>
                        ) : (
                            subjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                                                <div className="text-xs text-gray-400">{subject.studentCount || 0} étudiants</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <GraduationCap size={14} className="text-gray-400" />
                                            {subject.className || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <User size={14} className="text-gray-400" />
                                            {subject.teacher || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button
                                                onClick={() => onEdit(subject)}
                                                className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(subject)}
                                                className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

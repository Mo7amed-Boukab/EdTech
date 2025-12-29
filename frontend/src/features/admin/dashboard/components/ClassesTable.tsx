import { Edit2, Trash2, Users, GraduationCap } from "lucide-react";

interface ClassItem {
    id: string;
    name: string;
    level: string;
    studentCount: number;
    mainTeacher: string;
    academicYear: string;
}

interface ClassesTableProps {
    classes: ClassItem[];
    onEdit: (classItem: ClassItem) => void;
    onDelete: (classItem: ClassItem) => void;
}

export const ClassesTable = ({ classes, onEdit, onDelete }: ClassesTableProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classe</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Niveau</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prof Principal</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Effectif</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {classes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    Aucune classe trouvée
                                </td>
                            </tr>
                        ) : (
                            classes.map((cls) => (
                                <tr key={cls.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
                                                <GraduationCap size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                                                <div className="text-xs text-gray-400">{cls.academicYear}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {cls.level}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {cls.mainTeacher || <span className="text-gray-400 italic">Non assigné</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <Users size={14} className="text-gray-400" />
                                            {cls.studentCount} élèves
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button
                                                onClick={() => onEdit(cls)}
                                                className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(cls)}
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

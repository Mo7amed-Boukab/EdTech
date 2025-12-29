import { Edit2, Trash2, GraduationCap } from "lucide-react";

interface Student {
    id: string;
    fullName: string;
    email: string;
    class?: {
        id: string;
        name: string;
    };
    createdAt: string;
}

interface StudentsTableProps {
    students: Student[];
    onEdit: (student: Student) => void;
    onDelete: (student: Student) => void;
}

export const StudentsTable = ({ students, onEdit, onDelete }: StudentsTableProps) => {

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Étudiant</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classe</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    Aucun étudiant trouvé
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                                                {student.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                                                <div className="text-xs text-gray-400">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {student.class ? (
                                            <div className="flex items-center gap-1.5">
                                                <GraduationCap size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700 font-medium">{student.class.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Non assigné</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{new Date(student.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(student)}
                                                className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(student)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Supprimer"
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

            {/* Pagination Footer */}
            {students.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Affichage de <span className="font-medium">{students.length}</span> étudiant(s)
                    </span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 disabled:opacity-50 hover:bg-white" disabled>
                            Précédent
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-white">
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

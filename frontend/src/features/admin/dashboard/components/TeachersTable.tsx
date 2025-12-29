import { Edit2, Trash2, Mail } from "lucide-react";

interface Teacher {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    assignedClasses?: { id: string; name: string }[];
}

interface TeachersTableProps {
    teachers: Teacher[];
    onEdit: (teacher: Teacher) => void;
    onDelete: (teacher: Teacher) => void;
}

export const TeachersTable = ({ teachers, onEdit, onDelete }: TeachersTableProps) => {

    return (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enseignant</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classes Assignées</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {teachers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    Aucun enseignant trouvé
                                </td>
                            </tr>
                        ) : (
                            teachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-sm font-semibold">
                                                {teacher.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{teacher.fullName}</div>
                                                <div className="text-xs text-gray-400">ID: ...{teacher.id.toString().slice(-4)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Mail size={13} className="text-gray-400" />
                                                {teacher.email}
                                            </div>
                                            <div className="text-xs text-gray-400 pl-5">{teacher.phone || '-'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                                                teacher.assignedClasses.map((cls, idx) => (
                                                    <span key={cls.id || idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                        {cls.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Aucune classe</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button
                                                onClick={() => onEdit(teacher)}
                                                className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-gray-100 rounded transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(teacher)}
                                                className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-gray-100 rounded transition-colors"
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
            {teachers.length > 0 && (
                <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Affichage de <span className="font-medium">{teachers.length}</span> enseignant(s)
                    </span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 bg-white" disabled>
                            Précédent
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

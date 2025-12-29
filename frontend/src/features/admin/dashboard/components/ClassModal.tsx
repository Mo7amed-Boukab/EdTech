import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CustomSelect } from '../../../../components/CustomSelect';

interface TeacherOption {
    id: string;
    fullName: string;
}

interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: any) => void;
    classItem?: any;
    teachers?: TeacherOption[];
}

export const ClassModal = ({ isOpen, onClose, onSave, classItem, teachers = [] }: ClassModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        teacherId: '',
        academicYear: '2023-2024'
    });

    useEffect(() => {
        if (classItem) {
            setFormData({
                name: classItem.name,
                level: classItem.level || '',
                teacherId: classItem.teacher?.id || '',
                academicYear: classItem.academicYear || '2023-2024'
            });
        } else {
            setFormData({
                name: '',
                level: '',
                teacherId: '',
                academicYear: '2023-2024'
            });
        }
    }, [classItem, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 animate-in fade-in duration-200">
            <div className="bg-white rounded w-full max-w-lg animate-in zoom-in-95 duration-200 border border-gray-100 shadow-xl">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-medium text-gray-900">
                        {classItem ? 'Modifier Classe' : 'Ajouter une Classe'}
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la classe</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                placeholder="ex: Terminale S1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                    placeholder="ex: Terminale"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Année Scolaire</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                    placeholder="ex: 2023-2024"
                                />
                            </div>
                        </div>

                        <div>
                            <CustomSelect
                                label="Professeur Principal"
                                value={formData.teacherId}
                                onChange={(val) => setFormData({ ...formData, teacherId: val })}
                                options={teachers.map(t => ({ value: t.id, label: t.fullName }))}
                                placeholder="Sélectionner un professeur..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-gray-50">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium text-sm transition-colors">
                            {classItem ? 'Sauvegarder' : 'Créer la classe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

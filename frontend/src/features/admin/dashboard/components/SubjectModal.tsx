import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CustomSelect } from '../../../../components/CustomSelect';



interface SubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (subjectData: any) => void;
    subject?: any;
    availableClasses?: { id: string, name: string }[];
    availableTeachers?: { id: string, fullName: string }[];
}

export const SubjectModal = ({ isOpen, onClose, onSave, subject, availableClasses = [], availableTeachers = [] }: SubjectModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        classId: '',
        teacherId: ''
    });

    useEffect(() => {
        if (subject) {
            setFormData({
                name: subject.name,
                classId: subject.class?.id || '',
                teacherId: subject.teacher?.id || ''
            });
        } else {
            setFormData({
                name: '',
                classId: '',
                teacherId: ''
            });
        }
    }, [subject, isOpen]);

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
                        {subject ? 'Modifier Matière' : 'Ajouter une Matière'}
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la matière</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                    placeholder="ex: Mathématiques"
                                />
                            </div>

                            <div className="col-span-2">
                                <CustomSelect
                                    label="Classe"
                                    value={formData.classId}
                                    onChange={(val) => setFormData({ ...formData, classId: val })}
                                    options={availableClasses.map(c => ({ value: c.id, label: c.name }))}
                                    placeholder="Sélectionner une classe..."
                                />
                            </div>

                            <div className="col-span-2">
                                <CustomSelect
                                    label="Enseignant"
                                    value={formData.teacherId}
                                    onChange={(val) => setFormData({ ...formData, teacherId: val })}
                                    options={availableTeachers.map(t => ({ value: t.id, label: t.fullName }))}
                                    placeholder="Sélectionner un enseignant..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-gray-50">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium text-sm transition-colors">
                            {subject ? 'Sauvegarder' : 'Ajouter la matière'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

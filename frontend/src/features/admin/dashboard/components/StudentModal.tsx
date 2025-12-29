import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CustomSelect } from '../../../../components/CustomSelect';

interface StudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (studentData: any) => void;
    student?: any;
    availableClasses?: string[];
}

export const StudentModal = ({ isOpen, onClose, onSave, student, availableClasses = ['Terminale S1', '1ère S2', 'Seconde 3', '3ème A'] }: StudentModalProps) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        class: '',
        status: 'Active'
    });

    useEffect(() => {
        if (student) {
            setFormData({
                fullName: student.fullName,
                email: student.email,
                password: '', // Don't show
                phone: student.phone || '',
                parentName: student.parentName || '',
                parentPhone: student.parentPhone || '',
                class: student.class || '',
                status: student.status || 'Active'
            });
        } else {
            setFormData({
                fullName: '',
                email: '',
                password: '',
                phone: '',
                parentName: '',
                parentPhone: '',
                class: '',
                status: 'Active'
            });
        }
    }, [student, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 animate-in fade-in duration-200">
            <div className="bg-white rounded w-full max-w-xl animate-in zoom-in-95 duration-200 border border-gray-100 shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-medium text-gray-900">
                        {student ? 'Modifier Étudiant' : 'Ajouter un Étudiant'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        {/* Personal Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom Complet</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                    placeholder="ex: Thomas Martin"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                    placeholder="email@etudiant.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                            <input
                                type="password"
                                required={!student}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                placeholder={student ? "Laisser vide pour ne pas changer" : "Créer un mot de passe"}
                            />
                        </div>

                        {/* Academic Info */}
                            <div>
                                <CustomSelect
                                    label="Classe Assignée"
                                    value={formData.class}
                                    onChange={(val) => setFormData({ ...formData, class: val })}
                                    options={availableClasses}
                                    placeholder="Sélectionner une classe..."
                                />
                            </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium text-sm transition-colors"
                        >
                            {student ? 'Sauvegarder' : 'Ajouter l\'étudiant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

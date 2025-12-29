import { X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface ClassOption {
    id: string;
    name: string;
}

interface Teacher {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    assignedClasses?: ClassOption[];
}

interface TeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (teacherData: any) => void;
    teacher?: Teacher;
    availableClasses?: ClassOption[]; // List of available classes
}

export const TeacherModal = ({ isOpen, onClose, onSave, teacher, availableClasses = [] }: TeacherModalProps) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        assignedClasses: [] as string[] // Store IDs of assigned classes
    });

    const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (teacher) {
            setFormData({
                fullName: teacher.fullName,
                email: teacher.email,
                phone: teacher.phone || '',
                password: '', 
                assignedClasses: teacher.assignedClasses?.map(c => c.id) || []
            });
        } else {
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                assignedClasses: []
            });
        }
    }, [teacher, isOpen]);

    // Close click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsClassDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleClass = (classId: string) => {
        setFormData(prev => {
            const exists = prev.assignedClasses.includes(classId);
            if (exists) {
                return { ...prev, assignedClasses: prev.assignedClasses.filter(id => id !== classId) };
            } else {
                return { ...prev, assignedClasses: [...prev.assignedClasses, classId] };
            }
        });
    };

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
                        {teacher ? 'Modifier Enseignant' : 'Ajouter un Enseignant'}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom Complet</label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                placeholder="ex: Jean Dupont"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                placeholder="email@edtech.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                            <input
                                type="password"
                                required={!teacher} // Required only for new users
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-300"
                                placeholder={teacher ? "Laisser vide pour ne pas changer" : "Créer un mot de passe"}
                            />
                        </div>

                        {/* Custom Multi-select for Class Assignment */}
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Classes Assignées</label>
                            <button
                                type="button"
                                onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all flex items-center justify-between text-left"
                            >
                                <span className={formData.assignedClasses.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                                    {formData.assignedClasses.length > 0
                                        ? formData.assignedClasses.map(id => availableClasses.find(c => c.id === id)?.name).filter(Boolean).join(', ')
                                        : 'Sélectionner des classes'}
                                </span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>

                            {isClassDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                                    {availableClasses.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-gray-500 italic">Aucune classe disponible</div>
                                    ) : (
                                        availableClasses.map((cls) => (
                                            <div
                                                key={cls.id}
                                                onClick={() => toggleClass(cls.id)}
                                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.assignedClasses.includes(cls.id)}
                                                    readOnly
                                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <span className="text-sm text-gray-700">{cls.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
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
                            {teacher ? 'Sauvegarder' : 'Ajouter l\'enseignant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

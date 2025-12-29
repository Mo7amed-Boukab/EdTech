import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '../../../../components/Header';
import { SearchInput } from '../../../../components/SearchInput';
import { SubjectsTable } from '../components/SubjectsTable';
import { SubjectModal } from '../components/SubjectModal';
import { DeleteConfirmationModal } from '../../../../components/DeleteConfirmationModal';

// Mock Data
const MOCK_SUBJECTS = [
    {
        id: 1,
        name: "Mathématiques",
        code: "MATH",
        coefficient: 7,
        className: "Terminale S1",
        teacher: "Jean Dupont",
        studentCount: 24,
        description: "Algèbre, Géométrie et Analyse"
    },
    {
        id: 2,
        name: "Physique-Chimie",
        code: "PC",
        coefficient: 6,
        className: "1ère S2",
        teacher: "Sarah Martin",
        studentCount: 28,
        description: "Sciences physiques et chimiques"
    },
    {
        id: 3,
        name: "Français",
        code: "FR",
        coefficient: 3,
        className: "Seconde 3",
        teacher: "Michel Dubois",
        studentCount: 30,
        description: "Littérature et langue française"
    },
    {
        id: 4,
        name: "Anglais",
        code: "ANG",
        coefficient: 3,
        className: "Terminale S1",
        teacher: "Sophie Richard",
        studentCount: 24,
        description: "Langue vivante 1"
    }
];

export const SubjectsManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [subjects, setSubjects] = useState(MOCK_SUBJECTS);

    // Filter Logic
    const filteredSubjects = useMemo(() => {
        return subjects.filter(sub => {
            const matchesSearch =
                sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.code.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [subjects, searchQuery]);

    // Handlers
    const handleAddSubject = () => {
        setSelectedSubject(null);
        setIsSubjectModalOpen(true);
    };

    const handleEditSubject = (sub: any) => {
        setSelectedSubject(sub);
        setIsSubjectModalOpen(true);
    };

    const handleDeleteClick = (sub: any) => {
        setSelectedSubject(sub);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedSubject) {
            setSubjects(subjects.filter(s => s.id !== selectedSubject.id));
            setIsDeleteModalOpen(false);
            setSelectedSubject(null);
        }
    };

    const handleSaveSubject = (subjectData: any) => {
        if (selectedSubject) {
            setSubjects(subjects.map(s =>
                s.id === selectedSubject.id
                    ? { ...s, ...subjectData }
                    : s
            ));
        } else {
            const newSubject = {
                id: Math.max(...subjects.map(s => s.id), 0) + 1,
                ...subjectData,
                studentCount: 0 // Default for new
            };
            setSubjects([...subjects, newSubject]);
        }
        setIsSubjectModalOpen(false);
        setSelectedSubject(null);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <Header
                title="Gestion des Matières"
                description="Configuration des matières enseignées et coefficients"
            />

            <div className="px-6 pb-6 space-y-6 mt-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="w-full sm:w-[420px]">
                            <SearchInput
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une matière..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAddSubject}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded hover:bg-teal-800 transition-colors shadow-sm font-medium text-sm w-full sm:w-auto"
                        >
                            <Plus size={18} />
                            <span>Ajouter une matière</span>
                        </button>
                    </div>
                </div>

                <SubjectsTable
                    subjects={filteredSubjects}
                    onEdit={handleEditSubject}
                    onDelete={handleDeleteClick}
                />

                <SubjectModal
                    isOpen={isSubjectModalOpen}
                    onClose={() => setIsSubjectModalOpen(false)}
                    onSave={handleSaveSubject}
                    subject={selectedSubject}
                    availableClasses={['Terminale S1', '1ère S2', 'Seconde 3']}
                    availableTeachers={['Jean Dupont', 'Sarah Martin', 'Michel Dubois', 'Sophie Richard']}
                />

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    itemName={selectedSubject?.name}
                    itemType="matière"
                />
            </div>
        </div>
    );
};

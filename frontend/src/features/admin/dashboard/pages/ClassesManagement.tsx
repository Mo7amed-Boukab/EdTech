import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { CustomSelect } from '../../../../components/CustomSelect';
import { Header } from '../../../../components/Header';
import { SearchInput } from '../../../../components/SearchInput';
import { ClassesTable } from '../components/ClassesTable';
import { ClassModal } from '../components/ClassModal';
import { DeleteConfirmationModal } from '../../../../components/DeleteConfirmationModal';

// Mock Data
const MOCK_CLASSES = [
    {
        id: 1,
        name: "Terminale S1",
        level: "Terminale",
        studentCount: 24,
        mainTeacher: "Jean Dupont",
        academicYear: "2023-2024"
    },
    {
        id: 2,
        name: "1ère S2",
        level: "1ère",
        studentCount: 28,
        mainTeacher: "Sarah Martin",
        academicYear: "2023-2024"
    },
    {
        id: 3,
        name: "Seconde 3",
        level: "Seconde",
        studentCount: 30,
        mainTeacher: "Michel Dubois",
        academicYear: "2023-2024"
    },
    {
        id: 4,
        name: "3ème A",
        level: "3ème",
        studentCount: 25,
        mainTeacher: "",
        academicYear: "2023-2024"
    }
];

export const ClassesManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState("All");

    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [classes, setClasses] = useState(MOCK_CLASSES);

    // Filter Logic
    const filteredClasses = useMemo(() => {
        return classes.filter(cls => {
            const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLevel = levelFilter === "All" || cls.level === levelFilter;
            return matchesSearch && matchesLevel;
        });
    }, [classes, searchQuery, levelFilter]);

    // Handlers
    const handleAddClass = () => {
        setSelectedClass(null);
        setIsClassModalOpen(true);
    };

    const handleEditClass = (cls: any) => {
        setSelectedClass(cls);
        setIsClassModalOpen(true);
    };

    const handleDeleteClick = (cls: any) => {
        setSelectedClass(cls);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedClass) {
            setClasses(classes.filter(c => c.id !== selectedClass.id));
            setIsDeleteModalOpen(false);
            setSelectedClass(null);
        }
    };

    const handleSaveClass = (classData: any) => {
        if (selectedClass) {
            setClasses(classes.map(c =>
                c.id === selectedClass.id
                    ? { ...c, ...classData }
                    : c
            ));
        } else {
            const newClass = {
                id: Math.max(...classes.map(c => c.id), 0) + 1,
                ...classData,
                studentCount: 0
            };
            setClasses([...classes, newClass]);
        }
        setIsClassModalOpen(false);
        setSelectedClass(null);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <Header
                title="Gestion des Classes"
                description="Configuration des classes, niveaux et professeurs principaux"
            />
            <div className="px-6 pb-6 space-y-6 mt-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="w-full sm:w-[420px]">
                            <SearchInput
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une classe..."
                            />
                        </div>

                        <div className="w-full sm:w-[200px]">
                            <CustomSelect
                                value={levelFilter}
                                onChange={setLevelFilter}
                                options={['All', 'Terminale', '1ère', 'Seconde', '3ème']}
                                placeholder="Tous les niveaux"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAddClass}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded hover:bg-teal-800 transition-colors shadow-sm font-medium text-sm w-full sm:w-auto"
                        >
                            <Plus size={18} />
                            <span>Ajouter une classe</span>
                        </button>
                    </div>
                </div>

                <ClassesTable
                    classes={filteredClasses}
                    onEdit={handleEditClass}
                    onDelete={handleDeleteClick}
                />

                <ClassModal
                    isOpen={isClassModalOpen}
                    onClose={() => setIsClassModalOpen(false)}
                    onSave={handleSaveClass}
                    classItem={selectedClass}
                />

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    itemName={selectedClass?.name}
                    itemType="classe"
                />
            </div>
        </div>
    );
};

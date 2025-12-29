import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { CustomSelect } from '../../../../components/CustomSelect';
import { Header } from '../../../../components/Header';
import { SearchInput } from '../../../../components/SearchInput';
import { TeachersTable } from '../components/TeachersTable';
import { TeacherModal } from '../components/TeacherModal';
import { DeleteConfirmationModal } from '../../../../components/DeleteConfirmationModal';

// Mock Data
const MOCK_TEACHERS = [
    {
        id: 1,
        fullName: "Jean Dupont",
        email: "jean.dupont@edtech.com",
        phone: "06 12 34 56 78",
        assignedClasses: ["Terminale S1", "1ère S2"],
        joinDate: "2023-09-01"
    },
    {
        id: 2,
        fullName: "Sarah Martin",
        email: "sarah.martin@edtech.com",
        phone: "07 98 76 54 32",
        assignedClasses: ["Seconde 3"],
        joinDate: "2023-09-05"
    },
    {
        id: 3,
        fullName: "Michel Dubois",
        email: "michel.dubois@edtech.com",
        phone: "06 55 44 33 22",
        assignedClasses: [],
        joinDate: "2023-11-15"
    },
    {
        id: 4,
        fullName: "Sophie Richard",
        email: "sophie.richard@edtech.com",
        phone: "06 11 22 33 44",
        assignedClasses: ["Terminale L"],
        joinDate: "2023-01-20"
    }
];

export const TeachersManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("All");

    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [teachers, setTeachers] = useState(MOCK_TEACHERS);

    // Filter Logic
    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const matchesSearch =
                teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesClass = classFilter === "All" || teacher.assignedClasses.includes(classFilter);

            return matchesSearch && matchesClass;
        });
    }, [teachers, searchQuery, classFilter]);

    // Handlers
    const handleAddTeacher = () => {
        setSelectedTeacher(null);
        setIsTeacherModalOpen(true);
    };

    const handleEditTeacher = (teacher: any) => {
        setSelectedTeacher(teacher);
        setIsTeacherModalOpen(true);
    };

    const handleDeleteClick = (teacher: any) => {
        setSelectedTeacher(teacher);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedTeacher) {
            setTeachers(teachers.filter(t => t.id !== selectedTeacher.id));
            setIsDeleteModalOpen(false);
            setSelectedTeacher(null);
        }
    };

    const handleSaveTeacher = (teacherData: any) => {
        if (selectedTeacher) {
            // Edit mode
            setTeachers(teachers.map(t =>
                t.id === selectedTeacher.id
                    ? { ...t, ...teacherData }
                    : t
            ));
        } else {
            // Add mode
            const newTeacher = {
                id: Math.max(...teachers.map(t => t.id), 0) + 1,
                ...teacherData,
                joinDate: new Date().toLocaleDateString('en-CA'),
            };
            setTeachers([...teachers, newTeacher]);
        }
        setIsTeacherModalOpen(false);
        setSelectedTeacher(null);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <Header
                title="Gestion des Enseignants"
                description="Gérez les comptes enseignants et leurs assignations aux classes"
            />
            <div className="px-4 sm:px-6 pb-6 space-y-6 mt-4 sm:mt-6"> 
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="w-full sm:w-[420px]">
                            <SearchInput
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher un enseignant..."
                            />
                        </div>

                        {/* Class Filter Dropdown */}
                        <div className="w-full sm:w-[200px]">
                            <CustomSelect
                                value={classFilter}
                                onChange={setClassFilter}
                                options={['All', 'Terminale S1', '1ère S2', 'Seconde 3', 'Terminale L']}
                                placeholder="Toutes les classes"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAddTeacher}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded hover:bg-teal-800 transition-colors shadow-sm font-medium text-sm w-full sm:w-auto"
                        >
                            <Plus size={18} />
                            <span>Ajouter un enseignant</span>
                        </button>
                    </div>
                </div>

                <TeachersTable
                    teachers={filteredTeachers}
                    onEdit={handleEditTeacher}
                    onDelete={handleDeleteClick}
                    onView={(teacher) => console.log('View', teacher)}
                />

                <TeacherModal
                    isOpen={isTeacherModalOpen}
                    onClose={() => setIsTeacherModalOpen(false)}
                    onSave={handleSaveTeacher}
                    teacher={selectedTeacher}
                    availableClasses={['Terminale S1', '1ère S2', 'Seconde 3', 'Terminale L']}
                />

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    itemName={selectedTeacher?.fullName}
                    itemType="enseignant"
                />
            </div>
        </div>
    );
};

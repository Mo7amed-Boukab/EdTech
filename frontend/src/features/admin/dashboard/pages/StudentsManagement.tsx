import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { CustomSelect } from '../../../../components/CustomSelect';
import { Header } from '../../../../components/Header';
import { SearchInput } from '../../../../components/SearchInput';
import { StudentsTable } from '../components/StudentsTable';
import { StudentModal } from '../components/StudentModal';
import { DeleteConfirmationModal } from '../../../../components/DeleteConfirmationModal';

// Mock Data
const MOCK_STUDENTS = [
    {
        id: 1,
        fullName: "Lucas Petit",
        email: "lucas.petit@student.com",
        class: "Terminale S1",
        status: "Active",
        joinDate: "2023-09-01",
        parentName: "Marie Petit",
        parentPhone: "06 12 34 56 78"
    },
    {
        id: 2,
        fullName: "Emma Leroy",
        email: "emma.leroy@student.com",
        class: "1ère S2",
        status: "Active",
        joinDate: "2023-09-01",
        parentName: "Paul Leroy",
        parentPhone: "06 98 76 54 32"
    },
    {
        id: 3,
        fullName: "Nathan Moreau",
        email: "nathan.moreau@student.com",
        class: "Seconde 3",
        status: "Inactive",
        joinDate: "2023-11-10",
        parentName: "Sophie Moreau",
        parentPhone: "06 11 22 33 44"
    },
    {
        id: 4,
        fullName: "Chloé Dupont",
        email: "chloe.dupont@student.com",
        class: "Terminale S1",
        status: "Graduated",
        joinDate: "2022-09-01",
        parentName: "Jean Dupont",
        parentPhone: "07 55 66 77 88"
    }
];

export const StudentsManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [classFilter, setClassFilter] = useState("All");

    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [students, setStudents] = useState(MOCK_STUDENTS);

    // Filter Logic
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "All" || student.status === statusFilter;
            const matchesClass = classFilter === "All" || student.class === classFilter;

            return matchesSearch && matchesStatus && matchesClass;
        });
    }, [students, searchQuery, statusFilter, classFilter]);

    // Handlers
    const handleAddStudent = () => {
        setSelectedStudent(null);
        setIsStudentModalOpen(true);
    };

    const handleEditStudent = (student: any) => {
        setSelectedStudent(student);
        setIsStudentModalOpen(true);
    };

    const handleDeleteClick = (student: any) => {
        setSelectedStudent(student);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedStudent) {
            setStudents(students.filter(s => s.id !== selectedStudent.id));
            setIsDeleteModalOpen(false);
            setSelectedStudent(null);
        }
    };

    const handleSaveStudent = (studentData: any) => {
        if (selectedStudent) {
            // Edit mode
            setStudents(students.map(s =>
                s.id === selectedStudent.id
                    ? { ...s, ...studentData }
                    : s
            ));
        } else {
            // Add mode
            const newStudent = {
                id: Math.max(...students.map(s => s.id), 0) + 1,
                ...studentData,
                joinDate: new Date().toLocaleDateString('en-CA'),
            };
            setStudents([...students, newStudent]);
        }
        setIsStudentModalOpen(false);
        setSelectedStudent(null);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <Header
                title="Gestion des Étudiants"
                description="Gérez les inscriptions, assignations aux classes et suivi"
            />
            <div className="px-4 sm:px-6 pb-6 space-y-6 mt-4 sm:mt-6">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="w-full sm:w-[420px]">
                            <SearchInput
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher par nom ou email..."
                            />
                        </div>

                        {/* Class Dropdown */}
                        <div className="w-full sm:w-[200px]">
                            <CustomSelect
                                value={classFilter}
                                onChange={setClassFilter}
                                options={['All', 'Terminale S1', '1ère S2', 'Seconde 3']}
                                placeholder="Toutes les classes"
                            />
                        </div>

                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAddStudent}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded hover:bg-teal-800 transition-colors shadow-sm font-medium text-sm w-full sm:w-auto"
                        >
                            <Plus size={18} />
                            <span>Ajouter un étudiant</span>
                        </button>
                    </div>
                </div>

                <StudentsTable
                    students={filteredStudents}
                    onEdit={handleEditStudent}
                    onDelete={handleDeleteClick}
                    onView={(student) => console.log('View', student)}
                />

                <StudentModal
                    isOpen={isStudentModalOpen}
                    onClose={() => setIsStudentModalOpen(false)}
                    onSave={handleSaveStudent}
                    student={selectedStudent}
                />

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    itemName={selectedStudent?.fullName}
                    itemType="étudiant"
                />
            </div>
        </div>
    );
};

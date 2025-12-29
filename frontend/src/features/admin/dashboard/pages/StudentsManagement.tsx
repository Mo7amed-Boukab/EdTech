import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CustomSelect } from '../../../../components/CustomSelect';
import { Header } from '../../../../components/Header';
import { SearchInput } from '../../../../components/SearchInput';
import { StudentsTable } from '../components/StudentsTable';
import { StudentModal } from '../components/StudentModal';
import { DeleteConfirmationModal } from '../../../../components/DeleteConfirmationModal';
import { studentApi } from '../../services/student.api';
import { classApi } from '../../services/class.api';
import { useDebounce } from '../../../../hooks/useDebounce';
import type { Student } from '../../types/student.types';
import type { Class } from '../../types/class.types';

export const StudentsManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("All");

    const [students, setStudents] = useState<Student[]>([]);
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    const debouncedSearch = useDebounce(searchQuery, 500);

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const filters: any = {
                limit: 100,
                ...(debouncedSearch && { search: debouncedSearch })
            };

            if (classFilter !== "All") {
                filters.classId = classFilter;
            }

            const [studentsRes, classesRes] = await Promise.all([
                studentApi.getAll(filters),
                classApi.getAll({ limit: 100 })
            ]);

            setStudents(studentsRes.data);
            setAllClasses(classesRes.data);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [debouncedSearch, classFilter]);

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

    const handleConfirmDelete = async () => {
        if (!selectedStudent) return;
        try {
            await studentApi.delete(selectedStudent.id);
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedStudent(null);
        } catch (err: any) {
            console.error('Error deleting student:', err);
        }
    };

    const handleSaveStudent = async (studentData: any) => {
        try {
            if (selectedStudent) {
                // Update
                await studentApi.update(selectedStudent.id, {
                    fullName: studentData.fullName,
                    email: studentData.email,
                    password: studentData.password || undefined,
                    classId: studentData.classId || undefined
                });
            } else {
                // Create
                await studentApi.create({
                    fullName: studentData.fullName,
                    email: studentData.email,
                    password: studentData.password,
                    role: 'STUDENT', 
                    classId: studentData.classId || undefined
                });
            }
            await fetchData();
            setIsStudentModalOpen(false);
            setSelectedStudent(null);
        } catch (err: any) {
            console.error('Error saving student:', err);
        }
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
                                options={['All', ...allClasses.map(c => ({ value: c.id, label: c.name }))]}
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

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <StudentsTable
                        students={students}
                        onEdit={handleEditStudent}
                        onDelete={handleDeleteClick}
                        onView={(student) => console.log('View', student)}
                    />
                )}

                <StudentModal
                    isOpen={isStudentModalOpen}
                    onClose={() => setIsStudentModalOpen(false)}
                    onSave={handleSaveStudent}
                    student={selectedStudent}
                    availableClasses={allClasses.map(c => ({ id: c.id, name: c.name }))}
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

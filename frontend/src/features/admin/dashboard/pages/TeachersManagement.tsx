import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { CustomSelect } from '../../../../components/CustomSelect';
import { Header } from '../../../../components/Header';
import { SearchInput } from '../../../../components/SearchInput';
import { TeachersTable } from '../components/TeachersTable';
import { TeacherModal } from '../components/TeacherModal';
import { DeleteConfirmationModal } from '../../../../components/DeleteConfirmationModal';
import { teacherApi } from '../../services/teacher.api';
import { classApi } from '../../services/class.api';
import { useDebounce } from '../../../../hooks/useDebounce';
import type { Class } from '../../types/class.types';
import type { Teacher } from '../../types/teacher.types';

export const TeachersManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("All");

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

    const debouncedSearch = useDebounce(searchQuery, 500);

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Parallel fetch
            const [teachersRes, classesRes] = await Promise.all([
                teacherApi.getAll({ limit: 100, search: debouncedSearch }),
                classApi.getAll({ limit: 100 })
            ]);

            setTeachers(teachersRes.data);
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
    }, [debouncedSearch]);

    // Prepare table data
    const tableTeachers = useMemo(() => {
        let filtered = teachers;

        if (classFilter !== "All") {
            // Filter by class ID
            filtered = filtered.filter(t =>
                allClasses.some(c => c.id === classFilter && c.teacher?.id === t.id)
            );
        }

        return filtered.map(t => {
            // Find assigned classes for this teacher
            const assigned = allClasses
                .filter(c => c.teacher?.id === t.id)
                .map(c => ({ id: c.id, name: c.name }));

            return {
                id: t.id,
                fullName: t.fullName,
                email: t.email,
                assignedClasses: assigned
            };
        });
    }, [teachers, allClasses, classFilter]);

    // Available classes for filter dropdown
    const filterClassOptions = useMemo(() => {
        return ['All', ...allClasses.map(c => ({ value: c.id, label: c.name }))];
    }, [allClasses]);

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

    const handleConfirmDelete = async () => {
        if (!selectedTeacher) return;
        try {
            await teacherApi.delete(selectedTeacher.id);
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedTeacher(null);
        } catch (err: any) {
            console.error('Error deleting teacher:', err);
        }
    };

    const handleSaveTeacher = async (teacherData: any) => {
        try {
            let savedTeacher;
            if (selectedTeacher) {
                // Update
                savedTeacher = await teacherApi.update(selectedTeacher.id, {
                    fullName: teacherData.fullName,
                    email: teacherData.email,
                    password: teacherData.password || undefined // Only send if set
                });
            } else {
                // Create
                savedTeacher = await teacherApi.create({
                    fullName: teacherData.fullName,
                    email: teacherData.email,
                    password: teacherData.password,
                    role: 'TEACHER'
                });
            }

            // Current assigned classes for this teacher (from allClasses state)
            const currentClassIds = allClasses
                .filter(c => c.teacher?.id === savedTeacher.id)
                .map(c => c.id);

            const newClassIds: string[] = teacherData.assignedClasses;

            // Classes to assign
            for (const classId of newClassIds) {
                if (!currentClassIds.includes(classId)) {
                    await classApi.assignTeacher(classId, savedTeacher.id);
                }
            }

            await fetchData();
            setIsTeacherModalOpen(false);
            setSelectedTeacher(null);
        } catch (err: any) {
            console.error('Error saving teacher:', err);
        }
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
                                options={filterClassOptions}
                                placeholder="Filtrer par classe"
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
                    <TeachersTable
                        teachers={tableTeachers}
                        onEdit={handleEditTeacher}
                        onDelete={handleDeleteClick}
                        onView={(teacher) => console.log('View', teacher)}
                    />
                )}

                <TeacherModal
                    isOpen={isTeacherModalOpen}
                    onClose={() => setIsTeacherModalOpen(false)}
                    onSave={handleSaveTeacher}
                    teacher={selectedTeacher}
                    availableClasses={allClasses.map(c => ({ id: c.id, name: c.name }))}
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

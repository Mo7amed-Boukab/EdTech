import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CustomSelect } from '../../../../components/CustomSelect';
import { Header } from '../../../../components/Header';
import { SearchInput } from '../../../../components/SearchInput';
import { ClassesTable } from '../components/ClassesTable';
import { ClassModal } from '../components/ClassModal';
import { DeleteConfirmationModal } from '../../../../components/DeleteConfirmationModal';
import { classApi } from '../../services/class.api';
import { teacherApi } from '../../services/teacher.api';
import { useDebounce } from '../../../../hooks/useDebounce';
import type { Class } from '../../types/class.types';

export const ClassesManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState("All");
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<{ id: string, fullName: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    // Debounce search query for better performance
    const debouncedSearch = useDebounce(searchQuery, 500);

    // Fetch classes from API
    const fetchClasses = async () => {
        try {
            setLoading(true);
            setError(null);

            const filters = {
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(levelFilter !== "All" && { level: levelFilter }),
                limit: 100 // Get all classes for now
            };

            const response = await classApi.getAll(filters);
            setClasses(response.data);
        } catch (err: any) {
            console.error('Error fetching classes:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement des classes');
        } finally {
            setLoading(false);
        }
    };

    // Fetch teachers for the modal
    const fetchTeachers = async () => {
        try {
            const response = await teacherApi.getAll({ limit: 100 });
            setTeachers(response.data.map((t: any) => ({
                id: t.id,
                fullName: t.fullName
            })));
        } catch (err) {
            console.error('Error fetching teachers:', err);
        }
    };

    // Fetch classes on mount and when filters change
    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, [debouncedSearch, levelFilter]);

    // Handlers
    const handleAddClass = () => {
        setSelectedClass(null);
        setIsClassModalOpen(true);
    };

    const handleEditClass = (cls: Class) => {
        setSelectedClass(cls);
        setIsClassModalOpen(true);
    };

    const handleDeleteClick = (cls: Class) => {
        setSelectedClass(cls);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedClass) return;

        try {
            await classApi.delete(selectedClass.id);
            await fetchClasses(); // Refresh list
            setIsDeleteModalOpen(false);
            setSelectedClass(null);
        } catch (err: any) {
            console.error('Error deleting class:', err);
        }
    };

    const handleSaveClass = async (classData: any) => {
        try {
            if (selectedClass) {
                // Update existing class
                await classApi.update(selectedClass.id, classData);
            } else {
                // Create new class
                await classApi.create(classData);
            }

            await fetchClasses(); // Refresh list
            setIsClassModalOpen(false);
            setSelectedClass(null);
        } catch (err: any) {
            console.error('Error saving class:', err);
        }
    };

    // Transform classes for table display
    const tableClasses = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        level: cls.level || '-',
        studentCount: cls._count?.students || 0,
        mainTeacher: cls.teacher?.fullName || '-',
        academicYear: cls.academicYear || '-'
    }));

    return (
        <div className="animate-in fade-in duration-500">
            <Header
                title="Gestion des Classes"
                description="Configuration des classes, niveaux et professeurs principaux"
            />
            <div className="px-4 sm:px-6 pb-6 space-y-6 mt-4 sm:mt-6">
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
                                options={['All', ...Array.from(new Set(classes.map(c => c.level).filter(Boolean))) as string[]]}
                                placeholder="Filtrer par niveau"
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

                {/* Classes Table */}
                {!loading && !error && (
                    <ClassesTable
                        classes={tableClasses}
                        onEdit={(cls) => handleEditClass(classes.find(c => c.id === cls.id)!)}
                        onDelete={(cls) => handleDeleteClick(classes.find(c => c.id === cls.id)!)}
                    />
                )}

                <ClassModal
                    isOpen={isClassModalOpen}
                    onClose={() => setIsClassModalOpen(false)}
                    onSave={handleSaveClass}
                    classItem={selectedClass}
                    teachers={teachers}
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

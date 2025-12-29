import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '../../../../components/Header';
import { SearchInput } from '../../../../components/SearchInput';
import { CustomSelect } from '../../../../components/CustomSelect';
import { SubjectsTable } from '../components/SubjectsTable';
import { SubjectModal } from '../components/SubjectModal';
import { DeleteConfirmationModal } from '../../../../components/DeleteConfirmationModal';
import { subjectApi } from '../../services/subject.api';
import { classApi } from '../../services/class.api';
import { teacherApi } from '../../services/teacher.api';
import { useDebounce } from '../../../../hooks/useDebounce';
import type { Subject } from '../../types/subject.types';
import type { Class } from '../../types/class.types';

export const SubjectsManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("All");

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<{ id: string, fullName: string }[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const filters: any = {
                limit: 100,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(classFilter !== "All" && { classId: classFilter })
            };

            // Fetch subjects, classes, and teachers in parallel
            const [subjectsRes, classesRes, teachersRes] = await Promise.all([
                subjectApi.getAll(filters),
                classApi.getAll({ limit: 100 }),
                teacherApi.getAll({ limit: 100 })
            ]);

            setSubjects(subjectsRes.data);
            setClasses(classesRes.data);
            setTeachers(teachersRes.data.map((t: any) => ({
                id: t.id,
                fullName: t.fullName
            })));

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

    const handleConfirmDelete = async () => {
        if (!selectedSubject) return;
        try {
            await subjectApi.delete(selectedSubject.id);
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedSubject(null);
        } catch (err: any) {
            console.error('Error deleting subject:', err);
            alert('Erreur lors de la suppression');
        }
    };

    const handleSaveSubject = async (subjectData: any) => {
        try {
            if (selectedSubject) {
                // Update
                await subjectApi.update(selectedSubject.id, subjectData);
            } else {
                // Create
                await subjectApi.create(subjectData);
            }
            await fetchData();
            setIsSubjectModalOpen(false);
            setSelectedSubject(null);
        } catch (err: any) {
            console.error('Error saving subject:', err);
            alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <Header
                title="Gestion des Matières"
                description="Configuration des matières enseignées et coefficients"
            />

            <div className="px-4 sm:px-6 pb-6 space-y-6 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="w-full sm:w-[420px]">
                            <SearchInput
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une matière..."
                            />
                        </div>
                        <div className="w-full sm:w-[200px]">
                            <CustomSelect
                                value={classFilter}
                                onChange={setClassFilter}
                                options={['All', ...classes.map(c => ({ value: c.id, label: c.name }))]}
                                placeholder="Filtrer par classe"
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
                    <SubjectsTable
                        subjects={subjects}
                        onEdit={handleEditSubject}
                        onDelete={handleDeleteClick}
                    />
                )}

                <SubjectModal
                    isOpen={isSubjectModalOpen}
                    onClose={() => setIsSubjectModalOpen(false)}
                    onSave={handleSaveSubject}
                    subject={selectedSubject}
                    availableClasses={classes.map(c => ({ id: c.id, name: c.name }))}
                    availableTeachers={teachers}
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

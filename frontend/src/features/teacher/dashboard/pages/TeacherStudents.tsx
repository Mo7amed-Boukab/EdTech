import { useState, useEffect } from "react";
import { SearchInput } from "../../../../components/SearchInput";
import { CustomSelect } from "../../../../components/CustomSelect";
import {
  Mail,
  Loader2,
  GraduationCap
} from "lucide-react";
import { teacherService } from "../../services/teacherService";
import type { TeacherClass } from "../../types/teacher.types";

interface Student {
  id: string;
  fullName: string;
  email: string;
  classId: string;
  className: string;
}

export const TeacherStudents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Get Teacher's Classes
      const classesRes = await teacherService.getMyClasses({ limit: 100 });
      const teacherClasses = classesRes.data;
      setClasses(teacherClasses);

      // 2. For each class, fetch details (which includes students)
      // Note: This matches the logic discussed where we fetch class details to get students
      // Ideally backend ends providing a 'getMyStudents' would be better performance wise.
      const studentsPromises = teacherClasses.map(cls => teacherService.getClassById(cls.id));
      const classesDetails = await Promise.all(studentsPromises);

      // 3. Flatten students
      const allStudents: Student[] = [];
      classesDetails.forEach(cls => {
        // We know from backend service analysis that getClassById returns `students` array
        // We need to type cast or ensure types are correct. 
        // The TeacherClass type in frontend might not fully reflect the backend response of getClassById yet.
        // We'll treat cls as any for accessing students safely.
        const clsWithStudents = cls as any;
        if (clsWithStudents.students && Array.isArray(clsWithStudents.students)) {
          clsWithStudents.students.forEach((s: any) => {
            allStudents.push({
              id: s.id,
              fullName: s.fullName,
              email: s.email,
              classId: cls.id,
              className: cls.name
            });
          });
        }
      });

      setStudents(allStudents);

    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      classFilter === "All" || student.className === classFilter;
    return matchesSearch && matchesClass;
  });

  const classNames = Array.from(new Set(classes.map((c) => c.name)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">

      <div className="page-container">
        {/* Filters */}
        <div className="filters-bar">
          <div className="filters-bar-left">
            <div className="w-full-mobile">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
              />
            </div>
            <div className="w-full-mobile">
              <CustomSelect
                value={classFilter}
                onChange={setClassFilter}
                options={["All", ...classNames]}
                placeholder="Class"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Attendance</th>
                  {/* Teachers usually don't need Actions on students except maybe 'View Details' later on */}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={`${student.id}-${student.classId}`}>
                      <td data-label="Student Name">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-700">
                            <span className="font-medium text-sm">
                              {student.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {student.fullName}
                          </span>
                        </div>
                      </td>
                      <td data-label="Email">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} />
                          {student.email}
                        </div>
                      </td>
                      <td data-label="Class">
                        <span className="status-badge bg-red-50 text-red-700 flex items-center gap-1 w-fit">
                          <GraduationCap size={14} />
                          {student.className}
                        </span>
                      </td>
                      <td data-label="Attendance">
                        <span className="status-badge bg-gray-100 text-gray-600">
                          N/A
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {filteredStudents.length > 0 && (
          <div className="table-footer">
            <span className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{filteredStudents.length}</span>{" "}
              student(s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

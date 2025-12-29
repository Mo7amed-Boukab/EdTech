import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    ClipboardCheck,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    Clock,
    Menu,
    X
} from 'lucide-react';

type LucideIcon = React.ComponentType<any>;

interface SidebarItem {
    name: string;
    path: string;
    icon: LucideIcon;
}

const adminItems: SidebarItem[] = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Teachers', path: '/admin/teachers', icon: Users },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Classes', path: '/admin/classes', icon: BookOpen },
    { name: 'Subjects', path: '/admin/subjects', icon: ClipboardCheck },
    { name: 'Global Attendance', path: '/admin/attendance', icon: Calendar },
];

const teacherItems: SidebarItem[] = [
    { name: 'Overview', path: '/teacher', icon: LayoutDashboard },
    { name: 'My Classes', path: '/teacher/classes', icon: GraduationCap },
    { name: 'Sessions', path: '/teacher/sessions', icon: Clock },
    { name: 'Subjects', path: '/teacher/subjects', icon: BookOpen },
    { name: 'My Students', path: '/teacher/students', icon: Users },
];

const studentItems: SidebarItem[] = [
    { name: 'Overview', path: '/student', icon: LayoutDashboard },
    { name: 'My Schedule', path: '/student/schedule', icon: Calendar },
    { name: 'Attendance', path: '/student/attendance', icon: ClipboardCheck },
];

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getItems = () => {
        switch (user?.role) {
            case 'ADMIN': return adminItems;
            case 'TEACHER': return teacherItems;
            case 'STUDENT': return studentItems;
            default: return [];
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 z-40"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200
                transition-all duration-300 ease-in-out flex flex-col
                ${isCollapsed ? 'w-20' : 'w-64'}
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        {/* Using the teal color from login page for the logo box */}
                        <div className="w-8 h-8 bg-teal-700 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">ET</span>
                        </div>
                        {!isCollapsed && (
                            <span className="text-xl font-bold text-gray-900 tracking-tight">EdTech</span>
                        )}
                    </div>

                    <button
                        onClick={toggleCollapse}
                        className={`
                            hidden lg:flex items-center justify-center w-6 h-6 rounded-sm bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors
                            ${isCollapsed ? 'absolute -right-3 top-7 shadow-sm border border-gray-100' : ''}
                        `}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {getItems().map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/admin' || item.path === '/teacher' || item.path === '/student'}
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-teal-800 text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                            >
                                <Icon size={20} className={`transition-colors duration-200 flex-shrink-0`} strokeWidth={1.5} />
                                {!isCollapsed && <span>{item.name}</span>}

                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-teal-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-100 space-y-2">
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500">
                            <User size={18} />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 px-3 py-2.5 w-full rounded-sm text-sm font-medium text-red-600 hover:bg-red-50 transition-colors
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span>Log out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`
                flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
                ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
            `}>
                <main className="flex-1 flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

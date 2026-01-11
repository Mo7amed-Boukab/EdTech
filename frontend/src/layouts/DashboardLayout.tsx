import { useState, useEffect } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  LogOut,
  ChevronRight,
  ChevronDown,
  Clock,
  Menu,
  FileText,
  Calendar,
} from "lucide-react";

type LucideIcon = React.ComponentType<any>;

interface SubMenuItem {
  name: string;
  path: string;
}

interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
  children?: SubMenuItem[];
}

// Admin Sidebar - Hierarchical Structure (consultation/management only)
const adminItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Attendance",
    path: "/admin/attendance",
    icon: ClipboardCheck,
    children: [{ name: "Global Attendance", path: "/admin/attendance" }],
  },
  {
    name: "Students",
    path: "/admin/students",
    icon: GraduationCap,
    children: [{ name: "Student List", path: "/admin/students" }],
  },
  {
    name: "Teachers",
    path: "/admin/teachers",
    icon: Users,
    children: [{ name: "Teacher List", path: "/admin/teachers" }],
  },
  {
    name: "Classes",
    path: "/admin/classes",
    icon: BookOpen,
    children: [{ name: "Class List", path: "/admin/classes" }],
  },
  {
    name: "Subjects",
    path: "/admin/subjects",
    icon: FileText,
    children: [{ name: "Subject List", path: "/admin/subjects" }],
  },
];

const teacherItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/teacher",
    icon: LayoutDashboard,
  },
  {
    name: "Attendance",
    path: "/teacher/attendance",
    icon: ClipboardCheck,
    children: [{ name: "Take Attendance", path: "/teacher/attendance" }],
  },
  {
    name: "Classes",
    path: "/teacher/classes",
    icon: GraduationCap,
    children: [{ name: "My Classes", path: "/teacher/classes" }],
  },
  {
    name: "Subjects",
    path: "/teacher/subjects",
    icon: BookOpen,
    children: [{ name: "My Subjects", path: "/teacher/subjects" }],
  },
  {
    name: "Sessions",
    path: "/teacher/sessions",
    icon: Clock,
    children: [{ name: "Session List", path: "/teacher/sessions" }],
  },
  {
    name: "Students",
    path: "/teacher/students",
    icon: Users,
    children: [{ name: "My Students", path: "/teacher/students" }],
  },
];

const studentItems: SidebarItem[] = [
  { name: "Dashboard", path: "/student", icon: LayoutDashboard },
  {
    name: "Attendance",
    path: "/student/attendance",
    icon: ClipboardCheck,
    children: [{ name: "My Attendance", path: "/student/attendance" }],
  },
  {
    name: "Schedule",
    path: "/student/schedule",
    icon: Calendar,
    children: [{ name: "Weekly Schedule", path: "/student/schedule" }],
  },
];

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Attendance",
    "Students",
    "Teachers",
    "Classes",
    "Subjects",
    "Sessions",
    "Schedule",
  ]);

  // Detect mobile vs tablet/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getItems = () => {
    switch (user?.role) {
      case "ADMIN":
        return adminItems;
      case "TEACHER":
        return teacherItems;
      case "STUDENT":
        return studentItems;
      default:
        return [];
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isItemActive = (item: SidebarItem) => {
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return location.pathname === item.path;
  };

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;

    // Admin routes
    if (path === "/admin") return "Overview";
    if (path === "/admin/attendance") return "Global Attendance";
    if (path === "/admin/students") return "Student List";
    if (path === "/admin/teachers") return "Teacher List";
    if (path === "/admin/classes") return "Class List";
    if (path === "/admin/subjects") return "Subject List";

    // Teacher routes
    if (path === "/teacher") return "Overview";
    if (path === "/teacher/attendance") return "Take Attendance";
    if (path === "/teacher/classes") return "My Classes";
    if (path === "/teacher/sessions") return "Session List";
    if (path === "/teacher/students") return "My Students";
    if (path === "/teacher/subjects") return "My Subjects";

    // Student routes
    if (path === "/student") return "Overview";
    if (path === "/student/attendance") return "Attendance History";
    if (path === "/student/schedule") return "My Schedule";

    return "Overview";
  };

  const pageTitle = getPageTitle();

  // Get bottom nav items (simplified - main items only, no children)
  const getBottomNavItems = () => {
    const items = getItems();
    // Return first 4-5 items for bottom nav (without nested children structure)
    return items.slice(0, 5).map((item) => ({
      name: item.name,
      path: item.children ? item.children[0].path : item.path,
      icon: item.icon,
    }));
  };

  // Format date/time
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ============================================
          TABLET & DESKTOP (≥ 768px) - Sidebar
          ============================================ */}
      {!isMobile && (
        <>
          {/* Sidebar */}
          <aside
            className={`
              fixed top-0 left-0 bottom-0 z-40 w-60 bg-[#1a1d21] border-r border-[#2d3136]
              flex flex-col h-screen transition-all duration-300
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* Logo & Branding */}
            <div className="h-[60px] flex flex-col justify-center px-5 border-b border-[#2d3136] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[#c41e3a] text-xl font-black">ED</span>
                <span className="text-white font-black text-xl tracking-wide">
                  Academy
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 overflow-y-auto">
              {getItems().map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                const isExpanded = expandedItems.includes(item.name);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <div key={item.path}>
                    {hasChildren ? (
                      <>
                        {/* Parent Item */}
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={`flex items-center gap-3 w-full py-2.5 px-5 text-[#8a8f95] text-xs font-medium uppercase tracking-wide cursor-pointer border-l-[3px] border-transparent transition-all duration-100 hover:bg-[#25292e] hover:text-white ${isActive
                              ? "bg-[#25292e] text-white border-l-[#c41e3a]"
                              : ""
                            }`}
                        >
                          <Icon size={18} className="opacity-70" />
                          <span className="flex-1 text-left">{item.name}</span>
                          {isExpanded ? (
                            <ChevronDown size={14} className="opacity-50" />
                          ) : (
                            <ChevronRight size={14} className="opacity-50" />
                          )}
                        </button>

                        {/* Submenu */}
                        {isExpanded && (
                          <div className="bg-black/15">
                            {item.children!.map((child) => (
                              <NavLink
                                key={child.path}
                                to={child.path}
                                className={({ isActive }) =>
                                  `block py-2.5 pr-4 pl-12 text-[#8a8f95] text-[13px] border-l-[3px] border-transparent transition-all duration-100 hover:text-white hover:bg-white/[0.03] ${isActive
                                    ? "text-[#e94560] border-l-[#e94560]"
                                    : ""
                                  }`
                                }
                              >
                                {child.name}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <NavLink
                        to={item.path}
                        end={
                          item.path === "/admin" ||
                          item.path === "/teacher" ||
                          item.path === "/student"
                        }
                        className={({ isActive }) =>
                          `flex items-center gap-3 py-2.5 px-5 text-[#8a8f95] text-sm cursor-pointer border-l-[3px] border-transparent transition-all duration-100 hover:bg-[#25292e] hover:text-white ${isActive
                            ? "bg-[#25292e] text-white border-l-[#c41e3a]"
                            : ""
                          }`
                        }
                      >
                        <Icon size={18} className="opacity-70" />
                        <span className="flex-1">{item.name}</span>
                      </NavLink>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-[#2d3136] flex-shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full py-2.5 px-5 text-red-400 text-sm cursor-pointer transition-all hover:bg-red-500/10"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300
          ${!isMobile && isSidebarOpen ? "md:ml-60" : ""}
          ${isMobile ? "pb-16" : ""}
        `}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-[60px] flex items-center justify-between px-6 gap-4 sticky top-0 z-30 max-md:px-4">
          {/* Left Side - Menu Icon + Page Title */}
          <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
            {/* Sidebar Toggle - Only on tablet/desktop */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center w-9 h-9 flex-shrink-0 text-gray-500 rounded-md transition-all hover:text-[#c41e3a]"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} strokeWidth={2} />
              </button>
            )}

            {/* Page Title */}
            <h1 className="text-sm sm:text-base md:text-lg font-light whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="text-[#c41e3a]">Dashboard</span>
              <span className="text-gray-400 mx-2 sm:mx-2.5">/</span>
              <span className="text-gray-400">{pageTitle}</span>
            </h1>
          </div>

          {/* Right Side - Profile */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <span className="text-[13px] text-gray-500 hidden md:block">
              {timeStr}, {dateStr}
            </span>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 bg-[#c41e3a] flex items-center justify-center text-white font-semibold text-[13px] rounded-full">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="hidden sm:flex items-center gap-1 text-sm text-gray-800">
                Hi {user?.fullName?.split(" ")[0] || "User"}
                <ChevronDown size={12} className="text-gray-400" />
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* ============================================
          MOBILE (< 768px) - Bottom Navigation Bar
          ============================================ */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] py-2 px-1 pb-[calc(8px+env(safe-area-inset-bottom,0px))]">
          {getBottomNavItems().map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path.includes("/admin") &&
                location.pathname.startsWith(item.path)) ||
              (item.name === "Dashboard" &&
                (location.pathname === "/admin" ||
                  location.pathname === "/teacher" ||
                  location.pathname === "/student"));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 min-w-[60px] text-[10px] font-medium transition-all ${isActive
                    ? "text-[#c41e3a]"
                    : "text-gray-500 hover:text-[#c41e3a]"
                  }`}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
          {/* Logout button in bottom nav */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 min-w-[60px] text-[10px] font-medium text-red-600 hover:text-[#c41e3a] transition-all"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </nav>
      )}
    </div>
  );
};

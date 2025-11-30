// src/components/layout/AppSidebar.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

// Icons
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  LockIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAuth } from "../context/AuthContext"; 
import { apiService } from "../services/api";

interface UserData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  date_joined?: string;
  role?: 'admin' | 'user';
}

interface UsersListResponse {
  count: number;
  results: Array<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
    role?: 'admin' | 'user';
  }>;
}

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  requiredRoles?: string[];
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean; 
    new?: boolean;
    requiredRoles?: string[];
  }[];
};

// Main navigation items with role requirements - UPDATED PATHS
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/user-dashboard",
    requiredRoles: ['user']
  },
    {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    requiredRoles: ['admin']
  },
  {
    icon: <UserCircleIcon />,
    name: "Members",
    path: "/members",
    requiredRoles: ['admin']
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
    requiredRoles: ['admin']
  },
    {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/user-calendar",
    requiredRoles: ['user']
  },
  {
    icon: <TableIcon />,
    name: "Zones",
    path: "/district",
    requiredRoles: ['admin']
  },
  {
    icon: <CalenderIcon />,
    name: "Treasurer",
    path: "/treasurer",
    requiredRoles: ['admin']
  },
    {
    icon: <CalenderIcon />,
    name: "Treasurer",
    path: "/user-treasurer",
    requiredRoles: ['user']
  },
  {
    icon: <UserCircleIcon />,
    name: "Colleges",
    path: "/collage",
    requiredRoles: ['admin']
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
    requiredRoles: ['user', 'admin']
  },
  {
    name: "Timetables",
    icon: <ListIcon />,
    requiredRoles: ['admin'],
    subItems: [
      { 
        name: "Zone Timetables", 
        path: "/timetable-zone", 
        pro: false,
        requiredRoles: ['admin']
      },
      { 
        name: "Branch Timetables", 
        path: "/timetable-branch", 
        pro: false,
        requiredRoles: ['admin']
      }
    ],
  },
  {
    name: "Timetables",
    icon: <ListIcon />,
    requiredRoles: ['user'],
    subItems: [
      { 
        name: "Zone Timetables", 
        path: "/user-timetable-zone", 
        pro: false,
        requiredRoles: ['user']
      },
      { 
        name: "Branch Timetables", 
        path: "/user-timetable-branch", 
        pro: false,
        requiredRoles: ['user']
      }
    ],
  },
  {
    name: "Users",
    icon: <TableIcon />,
    requiredRoles: ['admin'],
    subItems: [{ 
      name: "Users Management", 
      path: "/user lists", // Fixed path to match App.tsx
      pro: false 
    }],
  },
  {
    name: "Gallery & Library",
    icon: <PageIcon />,
    requiredRoles: ['admin'],
    subItems: [
      { 
        name: "Library", 
        path: "/library", 
        pro: false 
      },
      { 
        name: "Images", 
        path: "/images", 
        pro: false 
      },
    ],
  },
  {
    name: "Gallery & Library",
    icon: <PageIcon />,
    requiredRoles: ['user'],
    subItems: [
      { 
        name: "Library", 
        path: "/library-user", 
        pro: false 
      },
      { 
        name: "Images", 
        path: "/images-user", 
        pro: false 
      },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <BoxCubeIcon />,
    name: "Ministries",
    requiredRoles: ['admin'],
    subItems: [
      { 
        name: "Ministries", 
        path: "/ministries", 
        pro: false 
      },
      { 
        name: "APTEC", 
        path: "/aptec", 
        pro: false 
      },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Ministries",
    requiredRoles: ['user'],
    subItems: [
      { 
        name: "Ministries", 
        path: "/ministry-user", 
        pro: false 
      },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "User Management",
    requiredRoles: ['admin'],
    subItems: [
      { 
        name: "Manage Users", 
        path: "/manage", 
        pro: false 
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user: authUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // User role state
  const [userData, setUserData] = useState<UserData>({});
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Role determination function
  const determineFallbackRole = useCallback((user: UserData): 'admin' | 'user' => {
    if (user.role && (user.role === 'admin' || user.role === 'user')) {
      return user.role;
    }

    const storedRole = localStorage.getItem('user_role');
    if (storedRole && (storedRole === 'admin' || storedRole === 'user')) {
      return storedRole;
    }

    const userEmail = user.email?.toLowerCase() || '';
    const username = user.username?.toLowerCase() || '';
    
    const adminEmails = [
      'mwananjelaelisha36@gmail.com',
      'admin@tucasa-udom.com',
      'administrator@tucasa-udom.com'
    ];
    
    const adminUsernames = [
      'udom-zone-0001',
      'admin',
      'administrator',
      'superuser'
    ];

    if (adminEmails.includes(userEmail) || adminUsernames.includes(username)) {
      return 'admin';
    }

    return 'user';
  }, []);

  // Fetch user role from API
  const fetchUserRole = useCallback(async (user: UserData) => {
    try {
      setIsLoadingRole(true);
      
      const currentUser = apiService.getCurrentUser();
      if (!currentUser) {
        console.log('No current user found in sidebar');
        setUserRole('user');
        return;
      }

      const response = await apiService.request<UsersListResponse>('/users/', {
        method: 'GET',
      });

      console.log('Sidebar - Users API response:', response);

      const currentUserInList = response.results.find(
        u => u.id === currentUser.id || u.username === currentUser.username || u.email === currentUser.email
      );

      if (currentUserInList && currentUserInList.role) {
        console.log('Sidebar - Found user role from API:', currentUserInList.role);
        setUserRole(currentUserInList.role);
        localStorage.setItem('user_role', currentUserInList.role);
      } else {
        const fallbackRole = determineFallbackRole(user);
        console.log('Sidebar - Using fallback role:', fallbackRole);
        setUserRole(fallbackRole);
      }

    } catch (error) {
      console.error('Sidebar - Error fetching user role from API:', error);
      const fallbackRole = determineFallbackRole(user);
      console.log('Sidebar - Error fallback role:', fallbackRole);
      setUserRole(fallbackRole);
    } finally {
      setIsLoadingRole(false);
    }
  }, [determineFallbackRole]);

  // Load user data and role
  const loadUserDataAndRole = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser: UserData = storedUser ? JSON.parse(storedUser) : (authUser || {});
      setUserData(parsedUser);

      await fetchUserRole(parsedUser);
      
    } catch (error) {
      console.error('Sidebar - Error loading user data:', error);
      setUserData({});
      setUserRole('user');
      setIsLoadingRole(false);
    }
  }, [authUser, fetchUserRole]);

  // Load user data and fetch role on component mount
  useEffect(() => {
    if (authUser) {
      loadUserDataAndRole();
    }
  }, [authUser, loadUserDataAndRole]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/signin');
    }
  };

  // Check if user has required role for menu items
  const hasRequiredRole = useCallback((requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  }, [userRole]);

  // Filter menu items based on user role
  const filterMenuItems = useCallback((items: NavItem[]) => {
    return items.filter(item => hasRequiredRole(item.requiredRoles));
  }, [hasRequiredRole]);

  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);
  const [filteredOthersItems, setFilteredOthersItems] = useState<NavItem[]>([]);

  useEffect(() => {
    if (userRole) {
      setFilteredNavItems(filterMenuItems(navItems));
      setFilteredOthersItems(filterMenuItems(othersItems));
    } else {
      setFilteredNavItems([]);
      setFilteredOthersItems([]);
    }
  }, [userRole, filterMenuItems]);

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    if (!authUser) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          Please log in to view menu
        </div>
      );
    }

    if (isLoadingRole) {
      return (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            Loading menu...
          </div>
        </div>
      );
    }

    return (
      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size  ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => {
                    const hasSubItemAccess = hasRequiredRole(subItem.requiredRoles);
                    
                    if (!hasSubItemAccess) return null;

                    return (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const renderUserInfo = () => {
    if (!authUser) return null;

    const userName = userData.first_name && userData.last_name 
      ? `${userData.first_name} ${userData.last_name}`
      : userData.username || 'User';

    const displayRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User';

    const getUserInitial = () => {
      if (userData.first_name) {
        return userData.first_name.charAt(0).toUpperCase();
      }
      if (userData.username) {
        return userData.username.charAt(0).toUpperCase();
      }
      return "U";
    };

    return (
      <div className={`mt-auto border-t border-gray-200 dark:border-gray-700 pt-4 ${
        !isExpanded && !isHovered ? 'lg:px-2' : 'px-4'
      }`}>
        <div className={`flex items-center gap-3 mb-4 ${
          !isExpanded && !isHovered ? 'lg:justify-center' : ''
        }`}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {getUserInitial()}
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {isLoadingRole ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  displayRole
                )}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
            !isExpanded && !isHovered ? 'lg:justify-center' : ''
          }`}
        >
          <LockIcon className="w-5 h-5" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span>Logout</span>
          )}
        </button>
      </div>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/dashboard" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">TZ</span>
              </div>
              <h1 className="text-green-600 font-bold text-xl">TUCASA UDOM ZONE</h1>
            </div>
          ) : (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">TZ</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6 flex-1">
          <div className="flex flex-col gap-4">
            {/* Main Menu Section */}
            {filteredNavItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Menu"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(filteredNavItems, "main")}
              </div>
            )}

            {/* Others Section */}
            {filteredOthersItems.length > 0 && (
              <div className="mt-6">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Management"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(filteredOthersItems, "others")}
              </div>
            )}

            {/* No Access Message */}
            {authUser && filteredNavItems.length === 0 && filteredOthersItems.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>No menu items available for your role.</p>
                <p className="text-xs mt-1">Contact administrator for access.</p>
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Widget */}
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}

        {/* User Info and Logout */}
        {renderUserInfo()}
      </div>
    </aside>
  );
};

export default AppSidebar;
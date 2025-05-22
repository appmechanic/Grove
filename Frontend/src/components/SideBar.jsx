import {
  BarChart3,
  Building,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShoppingCart,
  UserCog,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    {
      name: "Admin Management",
      icon: Users,
      path: "/dashboard/admin-management",
    },
    {
      name: "Admin Activity Logs",
      icon: UserCog,
      path: "/dashboard/admin-activity-logs",
    },
    {
      name: "Location Management",
      icon: MapPin,
      path: "/dashboard/location-management",
    },
    {
      name: "Venue Controls",
      icon: Building,
      path: "/dashboard/venue-controls",
    },
    {
      name: "Product Management",
      icon: Package,
      path: "/dashboard/product-management",
    },
    {
      name: "User Management",
      icon: ShoppingCart,
      path: "/dashboard/user-management",
    },
    {
      name: "Event Management",
      icon: Calendar,
      path: "/dashboard/event-management",
    },
    {
      name: "Venue Management",
      icon: Building,
      path: "/dashboard/venue-management",
    },
    {
      name: "Deal Management",
      icon: BarChart3,
      path: "/dashboard/deal-management",
    },
    {
      name: "Reported Content",
      icon: FileText,
      path: "/dashboard/reported-content",
    },
    { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div
      className="w-64 min-h-screen flex flex-col"
      style={{ backgroundColor: "#A8C9A0" }}
    >
      {/* Grove Header */}
      <div className="flex items-center justify-center p-6 border-b border-[#314B2B]">
        <h1 className="text-4xl font-bold" style={{ color: "#314B2B" }}>
          Grove
        </h1>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4">
        <p className="text-sm text-[#333333] mt-1 pl-6 py-2">MASTER ADMIN CONTROLS</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-[#F5EBD6] transition-colors ${
                isActive ? "bg-[#F5EBD6]" : ""
              }`}
            >
              <Icon
                size={18}
                className={`mr-3 ${
                  isActive ? "text-[#444444] font-extrabold" : "text-[#333333]"
                }`}
              />
              <span
                className={`text-sm ${
                  isActive ? "text-[#444444] font-extrabold" : "text-[#333333]"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#314B2B]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-3 text-left transition-colors"
        >
          <LogOut size={18} className="mr-3 text-[#333333]" />
          <span className="text-sm text-[#333333]">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

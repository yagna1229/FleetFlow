/**
 * Sidebar — role-based navigation. Items filtered dynamically from Redux role.
 */
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROLE_PERMISSIONS } from "../constants/roles";
import "../css/sidebar.css";

const ALL_NAV_ITEMS = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/vehicles", icon: "🚛", label: "Vehicles" },
  { to: "/drivers", icon: "👤", label: "Drivers" },
  { to: "/trips", icon: "🗺️", label: "Trips" },
  { to: "/maintenance", icon: "🔧", label: "Maintenance" },
  { to: "/expenses", icon: "💰", label: "Expenses" },
  { to: "/analytics", icon: "📈", label: "Analytics" },
];

export default function Sidebar() {
  const role = useSelector((s) => s.auth.role);
  const allowedPaths = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.manager;

  // Filter nav items to only those the role can access
  const visibleItems = ALL_NAV_ITEMS.filter((item) =>
    allowedPaths.some((p) => item.to === p || item.to.startsWith(p + "/")),
  );

  return (
    <aside className="sidebar">
      <nav className="sidebarNav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebarLink${isActive ? " sidebarLinkActive" : ""}`
            }
          >
            <span className="sidebarIcon">{item.icon}</span>
            <span className="sidebarLabel">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Role indicator at bottom */}
      <div className="sidebarRoleBadge">
        <span className="sidebarRoleIcon">🔑</span>
        <span className="sidebarRoleLabel">
          {role?.replace(/_/g, " ") || "Loading..."}
        </span>
      </div>
    </aside>
  );
}

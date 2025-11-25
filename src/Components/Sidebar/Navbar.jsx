import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

// Icon imports
import { BiLogOut, BiLayout, BiLogIn } from "react-icons/bi";
import { TbUsers, TbReportAnalytics, TbTrash } from "react-icons/tb";
import { LuFile } from "react-icons/lu";
import { PiBasket } from "react-icons/pi";
import { HiOutlineHome } from "react-icons/hi";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import { FiUser } from "react-icons/fi";
import { MdDiscount } from "react-icons/md";

import logo from "../../Assets/logo/jass_logo_new.png";
import "./Navbar.css";

const STORE_MAP = {
  store1: "store1",
  store2: "store2",
  store3: "store3",
  store4: "store4"
};

const Navbar = ({
  children,
  onNavigation,
  isCollapsed = false,
  onToggleCollapse,
  pageDashboard = null
}) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedStore, setSelectedStore] = useState(
    localStorage.getItem("selectedStore") || "store1"
  );

  // -------------------------
  // SUPERADMIN → SWITCH STORE
  // -------------------------
  const handleStoreSwitch = (e) => {
    const storeKey = e.target.value;          // store1 / store2
    const realStoreId = STORE_MAP[storeKey];  // secure id

    // Save simple key
    localStorage.setItem("selectedStore", storeKey);
    setSelectedStore(storeKey);

    // Save REAL backend storeId
    localStorage.setItem("storeId", realStoreId);

    // Update inside user object as well
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.storeId = realStoreId;
    localStorage.setItem("user", JSON.stringify(user));

    window.location.reload();
  };

  // Sync collapse state
  useEffect(() => {
    setToggle(isCollapsed);
  }, [isCollapsed]);

  const handleToggle = (val) => {
    setToggle(val);
    if (onToggleCollapse) onToggleCollapse(val);
  };

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("permissions");
    localStorage.removeItem("user");
    localStorage.removeItem("storeId");
    localStorage.removeItem("selectedStore");
    setIsLoggedIn(false);
    setUserPermissions([]);
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
    setIsLoggedIn(!!token);
    setUserPermissions(permissions);
  }, []);

  // -------------------------
  // PAGE TITLES
  // -------------------------
  const getPageTitle = () => {
    const route = location.pathname;
    switch (route) {
      case "/customer":
        return "Customer Dashboard";
      case "/items":
        return "Products Management";
      case "/inventory":
        return "Inventory Management";
      case "/dashboard":
        return "Dashboard";
      case "/admin":
        return "Admin Management Dashboard";
      case "/productdiscount":
        return "Discount Dashboard";
      case "/defective":
        return "Product Disposal Dashboard";
      case "/report":
        return "Business Reports & Analytics";
      case "/":
        return "Invoice Dashboard";
      case "/admindashbaord":
        return "Super Dashboard";
      default:
        return "";
    }
  };

  const pageTitle = getPageTitle();

  // -------------------------
  // MENU ITEMS & PERMISSIONS
  // -------------------------
  const allMenuData = [
    { icon: <PiBasket />, title: "Invoice", path: "/", permission: "invoice" },
    { icon: <HiOutlineHome />, title: "Dashboard", path: "/dashboard", permission: "dashboard" },
    { icon: <HiOutlineHome />, title: "SuperDashboard", path: "/admindashbaord", permission: "superadmin" },
    { icon: <TbUsers />, title: "Customer", path: "/customer", permission: "customer" },
    { icon: <LuFile />, title: "Products", path: "/items", permission: "products" },
    { icon: <TbUsers />, title: "Admin", path: "/admin", permission: "admin" },
    { icon: <MdDiscount />, title: "Discount", path: "/productdiscount", permission: "discount" },
    { icon: <BiLayout />, title: "Inventory", path: "/inventory", permission: "inventory" },
    { icon: <TbTrash />, title: "Product Disposal", path: "/defective", permission: "disposal" },
    { icon: <TbReportAnalytics />, title: "Report", path: "/report", permission: "report" }
  ];

  const filteredMenuData = allMenuData.filter(item => {
    // Only superadmin can see super dashboard
    if (item.permission === "superadmin") {
      return userPermissions.includes("superadmin");
    }

    // Admin gets everything except superadmin items
    if (userPermissions.includes("admin")) {
      return item.permission !== "superadmin";
    }

    // Normal users → only their allowed permissions
    return userPermissions.includes(item.permission);
  });


  return (
    <>
      <div id="sidebar" className={toggle ? "hide" : ""}>
        <div className="logo">
          <div className="logoBox">
            {toggle ? (
              <GiHamburgerMenu
                className="menuIconHidden"
                onClick={() => handleToggle(false)}
              />
            ) : (
              <>
                <img src={logo} alt="Logo" className="sidebar-logo" />
                <RxCross1
                  className="menuIconHidden"
                  onClick={() => handleToggle(true)}
                />
              </>
            )}
          </div>
        </div>

        <ul className="side-menu top">
          {filteredMenuData.map(({ icon, title, path }, i) => (
            <li key={i}>
              <NavLink
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={(e) => {
                  if (onNavigation) {
                    e.preventDefault();
                    onNavigation(path);
                  }
                }}
              >
                <span className="menu-icon">{icon}</span>
                <span className="menu-title">{title}</span>
              </NavLink>
            </li>
          ))}

          {isLoggedIn && (
            <li className="logout-menu-item">
              <button className="sidebar-logout-btn" onClick={handleLogout}>
                <BiLogOut />
                <span>Logout</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      <div id="content">
        <nav>
          <div className="nav-main">
            <GiHamburgerMenu
              className="menuIcon"
              onClick={() => handleToggle(!toggle)}
            />

            {pageTitle && <div className="page-title">{pageTitle}</div>}
          </div>

          <div className="nav-right-section">

            {/* SUPERADMIN STORE SWITCH */}
            {isLoggedIn && userPermissions.includes("superadmin") && (
              <select
                className="store-switch-dropdown"
                value={selectedStore}
                onChange={handleStoreSwitch}
              >
                <option value="store1">Store 1</option>
                <option value="store2">Store 2</option>
                <option value="store3">Store 3</option>
                <option value="store4">Store 4</option>
              </select>
            )}

            {!isLoggedIn ? (
              <button className="icon-button" onClick={handleLogin} title="Login">
                <BiLogIn />
              </button>
            ) : (
              <div className="profile">
                <div className="profile-icon" title="Account">
                  <FiUser />
                </div>
                <button className="icon-button" onClick={handleLogout} title="Logout">
                  <BiLogOut />
                </button>
              </div>
            )}
          </div>
        </nav>

        {children}
      </div>
    </>
  );
};

export default Navbar;

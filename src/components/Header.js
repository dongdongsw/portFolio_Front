import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Header.css';

const HeaderNav = () => {
  const [hoverText, setHoverText] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    fetch("/api/user/session-info", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    fetch("/api/user/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setUser(null);
      navigate("/");
    });
  };

  const navItems = [
    { name: "MORE", path: "/postlist" },
    { name: "Contact us", path: "/contactus" },
    { name: "ABOUT", path: "/aboutme" }
  ];

  return (
    <div className="wrap">
      <nav>
        <div className="logo-wrap">
          <Link to="/" className="logo-text">Port Folio</Link>
        </div>
        <div className="nav_menu">
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onMouseOver={() => setHoverText(item.name)}
                  onMouseOut={() => setHoverText("")}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <Link
                  to="/mypage"
                  onMouseOver={() => setHoverText("Mypage")}
                  onMouseOut={() => setHoverText("")}
                >
                  Mypage
                </Link>
              </li>
            )}
          </ul>
          {user ? (
            <button className="nav--button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="home-a">
              <button className="nav--button">Login</button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default HeaderNav;

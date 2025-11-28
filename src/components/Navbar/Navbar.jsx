import { useNavigate } from "react-router-dom";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <h1>w_01</h1>

      <div className="navbar_buttons">
        <button onClick={() => navigate(-1)}>Go Back</button>
        <button onClick={() => navigate("/whiteboard")}>Whiteboard</button>
        <button onClick={() => navigate("/editor")}>Editor</button>
      </div>
    </nav>
  );
};

export default Navbar;

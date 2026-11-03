import "./Navbar.css";

export default function Navbar({ modelName = "GPT OSS 120B" }) {
  return (
    <header className="top-navbar">
      <div className="navbar-center">
        <span className="model-name">{modelName}</span>
      </div>
    </header>
  );
}

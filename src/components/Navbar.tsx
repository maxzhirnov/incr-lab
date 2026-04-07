import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link className="site-nav__brand" to="/">
          Incrementality Lab
        </Link>
      </div>
    </header>
  );
}

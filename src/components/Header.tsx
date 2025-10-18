import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">LJ</span>
          </div>
          <span className="text-xl font-bold text-foreground">LifeJar</span>
        </Link>

        <nav className="flex items-center gap-4">
          {!isLanding && (
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          )}
          {isLanding ? (
            <Link to="/dashboard">
              <Button>Get Started</Button>
            </Link>
          ) : (
            <Link to="/create">
              <Button>+ New Jar</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

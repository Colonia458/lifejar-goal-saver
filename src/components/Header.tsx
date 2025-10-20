import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLanding = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Don't show header on auth pages
  if (isAuthPage) {
    return null;
  }

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
          {user ? (
            <>
              {!isLanding && (
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
              <Link to="/create">
                <Button>+ New Jar</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.user_metadata?.first_name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {isLanding ? (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              ) : (
                <Link to="/login">
                  <Button>Sign In</Button>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

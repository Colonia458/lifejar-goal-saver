import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import JarCard from "@/components/JarCard";
import { Plus } from "lucide-react";
import { jarsApi } from "@/lib/api";
import { toast } from "sonner";

interface Jar {
  id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  is_public: boolean;
  deadline?: string;
  category?: string;
  image_url?: string;
  created_at: string;
}

const Dashboard = () => {
  const [jars, setJars] = useState<Jar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJars = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await jarsApi.getUserJars();
        if (response.success && response.data) {
          setJars(response.data);
        } else {
          setError("Failed to load jars");
        }
      } catch (err) {
        console.error("Error fetching jars:", err);
        setError(err instanceof Error ? err.message : "Failed to load jars");
        toast.error("Failed to load your jars");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJars();
  }, []);

  const totalSaved = jars.reduce((sum, jar) => sum + jar.current_amount, 0);
  const totalGoals = jars.reduce((sum, jar) => sum + jar.target_amount, 0);

  // Transform API response to JarCard format
  const transformedJars = jars.map(jar => ({
    id: jar.id,
    title: jar.title,
    description: jar.description || "",
    targetAmount: jar.target_amount,
    currentAmount: jar.current_amount,
    currency: jar.currency,
    isPublic: jar.is_public,
    deadline: jar.deadline,
    category: jar.category,
    image: jar.image_url,
    contributors: []
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Jars</h1>
          <p className="text-muted-foreground">Track and manage your savings goals</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
            <p className="text-3xl font-bold text-foreground">KSh {totalSaved.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Goals</p>
            <p className="text-3xl font-bold text-foreground">KSh {totalGoals.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Active Jars</p>
            <p className="text-3xl font-bold text-foreground">{jars.length}</p>
          </div>
        </div>

        {/* Jars Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">All Jars</h2>
            <Link to="/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Jar
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your jars...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-destructive/10 rounded-xl">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : transformedJars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transformedJars.map((jar) => (
                <JarCard key={jar.id} {...jar} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <p className="text-muted-foreground mb-4">No jars yet. Create your first one!</p>
              <Link to="/create">
                <Button>Create Jar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

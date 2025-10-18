import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import JarCard from "@/components/JarCard";
import { mockJars } from "@/lib/mockData";
import { Plus } from "lucide-react";

const Dashboard = () => {
  const totalSaved = mockJars.reduce((sum, jar) => sum + jar.currentAmount, 0);
  const totalGoals = mockJars.reduce((sum, jar) => sum + jar.targetAmount, 0);

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
            <p className="text-3xl font-bold text-foreground">{mockJars.length}</p>
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

          {mockJars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockJars.map((jar) => (
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

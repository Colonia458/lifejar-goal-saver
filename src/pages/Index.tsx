import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Target, Users, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Save Smarter. <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Reach Goals Faster.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create a LifeJar, invite friends, and grow your savings effortlessly.
            Turn your dreams into achievable goals with collaborative saving.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="text-lg px-8 py-6 h-auto">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-16">
            Why Choose LifeJar?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Goal-Based Saving</h3>
              <p className="text-muted-foreground">
                Create custom jars for each financial goal. Track progress visually and stay motivated.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Collaborative Saving</h3>
              <p className="text-muted-foreground">
                Invite friends and family to contribute. Reach your goals together, faster.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Track Your Progress</h3>
              <p className="text-muted-foreground">
                Beautiful progress bars and insights. See your savings grow in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary to-accent rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Your Savings Journey Today
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join thousands of smart savers achieving their financial goals with LifeJar.
          </p>
          <Link to="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
              Create Your First Jar
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;

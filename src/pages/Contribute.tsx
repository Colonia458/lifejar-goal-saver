import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgressBar from "@/components/ProgressBar";
import { getJarById } from "@/lib/mockData";
import { toast } from "sonner";

const Contribute = () => {
  const { id } = useParams<{ id: string }>();
  const jar = getJarById(id || "");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");

  if (!jar) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Jar not found</p>
          <Button onClick={() => window.location.href = "/"}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleContribute = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Placeholder for PayHero integration
    console.log("Contributing to jar:", jar.id, "Amount:", amount, "Name:", name);
    
    toast.success("Redirecting to PayHero...");
    // In production: window.location.href = payHeroUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-2xl">LJ</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">LifeJar</h1>
        </div>

        {/* Contribution Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
          {/* Jar Image */}
          <div className="aspect-video bg-muted relative overflow-hidden">
            {jar.image ? (
              <img src={jar.image} alt={jar.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl opacity-50">🏺</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">{jar.title}</h2>

            <ProgressBar current={jar.currentAmount} target={jar.targetAmount} />

            <p className="text-sm text-muted-foreground mt-4 mb-6">
              Help reach this savings goal by contributing any amount
            </p>

            {/* Contribution Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Amount (KSh)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>

              <Button onClick={handleContribute} className="w-full" size="lg">
                Pay with PayHero
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-6">
              Secure payment powered by PayHero
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contribute;

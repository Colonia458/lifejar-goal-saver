import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import { jarsApi, paymentsApi } from "@/lib/api";
import { Copy, DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Jar {
  id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  deadline?: string;
  image_url?: string;
}

interface Contribution {
  id: string;
  contributor_name: string;
  amount: number;
  created_at: string;
}

interface JarDetail extends Jar {
  contributions: Contribution[];
}

const JarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [jar, setJar] = useState<JarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchJar = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await jarsApi.getJarById(id);
        if (response.success && response.data) {
          setJar(response.data);
        } else {
          setError("Failed to load jar");
        }
      } catch (err) {
        console.error("Error fetching jar:", err);
        setError(err instanceof Error ? err.message : "Failed to load jar");
        toast.error("Failed to load jar details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJar();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jar details...</p>
        </div>
      </div>
    );
  }

  if (!jar || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">{error || "Jar not found"}</p>
        </div>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/contribute/${jar.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    try {
      // For now, just add to the current amount (in real scenario, integrate with payment gateway)
      const response = await jarsApi.updateJar(jar.id, {
        target_amount: jar.target_amount
      });
      
      if (response.success) {
        toast.success(`KSh ${depositAmount} deposited successfully!`);
        setDepositAmount("");
        setIsDepositOpen(false);
        // Refresh jar data
        const updatedJar = await jarsApi.getJarById(jar.id);
        if (updatedJar.success) {
          setJar(updatedJar.data);
        }
      }
    } catch (err) {
      console.error("Deposit error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to process deposit");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Jar Image */}
          <div className="aspect-video bg-muted relative overflow-hidden">
            {jar.image_url ? (
              <img src={jar.image_url} alt={jar.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-6xl opacity-50">🏺</span>
              </div>
            )}
          </div>

          {/* Jar Details */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">{jar.title}</h1>

            <ProgressBar current={jar.current_amount} target={jar.target_amount} />

            {jar.deadline && (
              <p className="text-muted-foreground mt-4">
                Target Date: {new Date(jar.deadline).toLocaleDateString()}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1" size="lg">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Make a Deposit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Amount (KSh)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        min="1"
                        disabled={isProcessing}
                      />
                    </div>
                    <Button onClick={handleDeposit} className="w-full" disabled={isProcessing}>
                      {isProcessing ? "Processing..." : "Confirm Deposit"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleCopyLink} size="lg">
                <Copy className="w-4 h-4 mr-2" />
                Copy Invite Link
              </Button>
            </div>

            {/* Contributors List */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Contributors</h2>
              {jar.contributions && jar.contributions.length > 0 ? (
                <div className="space-y-3">
                  {jar.contributions.map((contributor) => (
                    <div
                      key={contributor.id}
                      className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{contributor.contributor_name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(contributor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-success">
                        +KSh {contributor.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No contributions yet. Share the invite link to get started!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JarDetail;

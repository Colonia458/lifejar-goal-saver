import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import { getJarById } from "@/lib/mockData";
import { Copy, DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const JarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const jar = getJarById(id || "");
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  if (!jar) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Jar not found</p>
        </div>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/contribute/${jar.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  const handleDeposit = () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Placeholder for API call
    console.log("Depositing to jar:", jar.id, "Amount:", depositAmount);
    
    toast.success(`KSh ${depositAmount} deposited successfully!`);
    setDepositAmount("");
    setIsDepositOpen(false);
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
            {jar.image ? (
              <img src={jar.image} alt={jar.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-6xl opacity-50">🏺</span>
              </div>
            )}
          </div>

          {/* Jar Details */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">{jar.title}</h1>

            <ProgressBar current={jar.currentAmount} target={jar.targetAmount} />

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
                      />
                    </div>
                    <Button onClick={handleDeposit} className="w-full">
                      Confirm Deposit
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
              <div className="space-y-3">
                {jar.contributors.map((contributor, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{contributor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contributor.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold text-success">
                      +KSh {contributor.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JarDetail;

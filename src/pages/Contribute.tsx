import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgressBar from "@/components/ProgressBar";
import { paymentsApi, jarsApi } from "@/lib/api";
import { toast } from "sonner";

interface Jar {
  id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  image_url?: string;
}

const Contribute = () => {
  const { id } = useParams<{ id: string }>();
  const [jar, setJar] = useState<Jar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stk" | "pesapal">("stk");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchJar = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await jarsApi.getPublicJar(id);
        if (response.success && response.data) {
          setJar(response.data);
        } else {
          toast.error("Jar not found");
        }
      } catch (err) {
        console.error("Error fetching jar:", err);
        toast.error(err instanceof Error ? err.message : "Failed to load jar");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJar();
  }, [id]);

  const handleContribute = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (paymentMethod === "pesapal" && !email) {
      toast.error("Email is required for Pesapal payments");
      return;
    }

    if (paymentMethod === "stk" && !phoneNumber) {
      toast.error("Phone number is required for M-Pesa STK Push");
      return;
    }

    setIsProcessing(true);
    try {
      let result;
      
      if (paymentMethod === "stk") {
        result = await paymentsApi.initiateSTKPush({
          jar_id: id!,
          amount: Number(amount),
          contributor_name: name,
          phone_number: phoneNumber
        });
      } else {
        result = await paymentsApi.initiatePesapalPayment({
          jar_id: id!,
          amount: Number(amount),
          contributor_name: name,
          customer_email: email,
          customer_first_name: name.split(' ')[0],
          customer_last_name: name.split(' ').slice(1).join(' ') || 'Contributor'
        });
      }

      if (result.success) {
        toast.success("Payment initiated! Redirecting...");
        if (result.data?.payment_url) {
          // For Pesapal or other redirect payments
          window.location.href = result.data.payment_url;
        } else {
          // For STK Push, user will get prompt on their phone
          toast.success(`Check your ${paymentMethod === 'stk' ? 'phone' : 'email'} to complete payment`);
        }
      } else {
        toast.error(result.data?.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment initiation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jar...</p>
        </div>
      </div>
    );
  }

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
            {jar.image_url ? (
              <img src={jar.image_url} alt={jar.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl opacity-50">🏺</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">{jar.title}</h2>

            <ProgressBar current={jar.current_amount} target={jar.target_amount} />

            <p className="text-sm text-muted-foreground mt-4 mb-6">
              Help reach this savings goal by contributing any amount
            </p>

            {/* Contribution Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name *</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "stk" | "pesapal")}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                  disabled={isProcessing}
                >
                  <option value="stk">M-Pesa (STK Push)</option>
                  <option value="pesapal">Pesapal</option>
                </select>
              </div>

              {paymentMethod === "stk" ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                  <Input
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Amount (KSh) *</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  disabled={isProcessing}
                />
              </div>

              <Button onClick={handleContribute} className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Pay with ${paymentMethod === 'stk' ? 'M-Pesa' : 'Pesapal'}`}
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/Header";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { jarsApi } from "@/lib/api";

const CreateJar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    currency: "KES",
    isPublic: true,
    deadline: "",
    category: "",
    imagePreview: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.targetAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const jarData = {
        title: formData.title,
        description: formData.description || undefined,
        target_amount: parseFloat(formData.targetAmount),
        currency: formData.currency,
        is_public: formData.isPublic,
        deadline: formData.deadline || undefined,
        category: formData.category || undefined,
        image_url: formData.imagePreview || undefined,
      };

      await jarsApi.createJar(jarData);
      toast.success("Jar created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Create jar error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create jar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Create New Jar</h1>
          <p className="text-muted-foreground">Set up a new savings goal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-8">
            {/* Image Upload */}
            <div className="mb-6">
              <Label htmlFor="image" className="text-base mb-3 block">Jar Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  {formData.imagePreview ? (
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Click to upload an image</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <Label htmlFor="title" className="text-base mb-3 block">
                Jar Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Emergency Fund, New Laptop"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base"
                required
              />
            </div>

            {/* Target Amount */}
            <div className="mb-6">
              <Label htmlFor="target" className="text-base mb-3 block">
                Target Amount (KSh) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="target"
                type="number"
                placeholder="e.g., 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="text-base"
                required
                min="1"
              />
            </div>

            {/* Deadline */}
            <div className="mb-6">
              <Label htmlFor="deadline" className="text-base mb-3 block">
                Deadline (Optional)
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" size="lg">
                Create Jar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJar;

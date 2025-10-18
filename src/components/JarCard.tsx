import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgressBar";

interface JarCardProps {
  id: string;
  title: string;
  image?: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string;
}

const JarCard = ({ id, title, image, currentAmount, targetAmount, deadline }: JarCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-4xl opacity-50">🏺</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
        
        <ProgressBar current={currentAmount} target={targetAmount} />
        
        {deadline && (
          <p className="text-sm text-muted-foreground mt-3">
            Due: {new Date(deadline).toLocaleDateString()}
          </p>
        )}
        
        <Link to={`/jar/${id}`} className="block mt-4">
          <Button className="w-full">View Jar</Button>
        </Link>
      </div>
    </div>
  );
};

export default JarCard;

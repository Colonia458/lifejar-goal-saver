interface ProgressBarProps {
  current: number;
  target: number;
  variant?: "default" | "success";
}

const ProgressBar = ({ current, target, variant = "default" }: ProgressBarProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = percentage >= 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-foreground">
          KSh {current.toLocaleString()}
        </span>
        <span className="text-muted-foreground">
          KSh {target.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isComplete
              ? "bg-gradient-to-r from-success to-emerald-400"
              : "bg-gradient-to-r from-primary to-accent"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-sm text-muted-foreground mt-1">
        {percentage.toFixed(1)}% complete
      </div>
    </div>
  );
};

export default ProgressBar;

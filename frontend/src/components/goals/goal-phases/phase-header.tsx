interface CreateGoalPhaseHeaderProps {
  title: string;
  subheading: string;
}

export const CreateGoalPhaseHeader = ({
  title,
  subheading,
}: CreateGoalPhaseHeaderProps) => {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subheading}</p>
      </div>
    </div>
  );
};

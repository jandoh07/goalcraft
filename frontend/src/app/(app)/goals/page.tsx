import MobileHeader from "@/components/layout/mobile/header";
import ObjectiveCard from "@/components/objectives/objective-card";

const Goals = () => {
  return (
    <div>
      <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
        <MobileHeader title="Goals" />

        <div>
          <ObjectiveCard />
        </div>
      </div>
    </div>
  );
};

export default Goals;

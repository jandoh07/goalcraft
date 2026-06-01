"use client";

import MobileHeader from "@/components/layout/mobile/header";
// import ReviewDialog from "@/components/review/review-dialog";

const Review = () => {
  return (
    <div className="max-w-7xl h-full mx-auto p-2 md:p-3 relative flex flex-col gap-6">
      <div className="flex items-center justify-between mt-2 md:mt-0">
        <div>
          <h1 className="hidden md:block text-2xl font-bold tracking-tight">
            Review
          </h1>
          <MobileHeader title="Review" />
        </div>
      </div>

      {/* <ReviewDialog /> */}
    </div>
  );
};

export default Review;

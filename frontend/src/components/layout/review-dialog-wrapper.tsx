"use client";

import { Suspense } from "react";
import ReviewDialog from "./review-dialog";

const ReviewDialogWrapper = () => {
  return (
    <Suspense fallback={null}>
      <ReviewDialog />
    </Suspense>
  );
};

export default ReviewDialogWrapper;

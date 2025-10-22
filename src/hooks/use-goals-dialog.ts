import { Goal } from "@/types";
import React from "react";

const useGoalsDialog = ({
  setInitialData,
  setOpen,
}: {
  setInitialData: React.Dispatch<React.SetStateAction<Goal | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleAddNew = () => {
    setInitialData(undefined);
    setOpen(true);
  };

  const handleExternalFormSubmit = () => {
    const form = document.getElementById("goal-form");

    if (form) {
      form.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  return { handleAddNew, handleExternalFormSubmit };
};

export default useGoalsDialog;

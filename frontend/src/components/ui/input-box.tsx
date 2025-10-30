import React from "react";
import { Label } from "./label";
import { Input } from "./input";

interface InputBoxProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  id?: string;
}

const InputBox = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  id,
}: InputBoxProps) => {
  return (
    <div className="grid gap-3">
      <Label htmlFor={id || label.toLowerCase().replace(" ", "-")}>
        {label}
      </Label>
      <Input
        type={type}
        id={id || label.toLowerCase().replace(" ", "-")}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default InputBox;

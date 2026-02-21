import { useState } from "react";

export function useSimpleDialog(
  onAdd: (value: string) => void,
  onClose: () => void,
  requiredMessage: string
) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setValue("");
    setError("");
    onClose();
  };

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(requiredMessage);
      return;
    }
    onAdd(trimmed);
    setValue("");
    setError("");
    onClose();
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (error) setError("");
  };

  return { value, error, handleChange, handleClose, handleAdd };
}

import { X } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type {
  HyperparameterField,
  HyperparameterSearchSpace,
  HyperparameterArrayValue,
} from "../types";

interface SearchSpaceFormProps {
  fields: HyperparameterField[];
  values: HyperparameterSearchSpace;
  onChange: (name: string, value: HyperparameterArrayValue) => void;
  errors?: Record<string, string>;
}

export function SearchSpaceForm({
  fields,
  values,
  onChange,
  errors = {},
}: SearchSpaceFormProps) {
  // Track input values for number fields (comma-separated)
  const [numberInputs, setNumberInputs] = useState<Record<string, string>>({});

  const renderField = (field: HyperparameterField) => {
    const value = values[field.name] ?? [];
    const error = errors[field.name];

    switch (field.type) {
      case "number": {
        // For number fields, show a text input for comma-separated values
        // Also show a list of added values with remove buttons
        const inputValue = numberInputs[field.name] ?? "";
        
        const handleAddValue = () => {
          const trimmed = inputValue.trim();
          if (!trimmed) return;
          
          // Parse as number
          const num = Number(trimmed);
          if (Number.isNaN(num)) return;
          
          // Add to array if not already present
          if (!value.includes(num)) {
            onChange(field.name, [...value, num] as HyperparameterArrayValue);
          }
          setNumberInputs((prev) => ({ ...prev, [field.name]: "" }));
        };

        const handleRemoveValue = (val: number) => {
          onChange(
            field.name,
            value.filter((v) => v !== val) as HyperparameterArrayValue
          );
        };

        return (
          <div key={field.name} className="w-full">
            <Label className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-display mb-2 block">
              {field.label}
              <span className="text-white/60 font-normal text-sm ml-2">
                (default: {String(field.defaultValue ?? "none")})
              </span>
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) =>
                  setNumberInputs((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                placeholder="Enter value and press Enter"
                className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[14px] sm:text-[16px] placeholder:text-white/60 flex-1"
              />
              <button
                type="button"
                onClick={handleAddValue}
                className="h-[36px] sm:h-[40px] px-4 bg-[#006b4c] hover:bg-[#007d59] text-white text-sm font-display rounded"
              >
                Add
              </button>
            </div>
            {/* Show added values as chips */}
            {value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(value as number[]).map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1 bg-[#1175d5] text-white px-2 py-1 rounded text-sm"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(val)}
                      className="hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {error && (
              <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                {error}
              </p>
            )}
          </div>
        );
      }

      case "text": {
        // For text fields, show similar UI to number fields
        const inputValue = numberInputs[field.name] ?? "";
        
        const handleAddValue = () => {
          const trimmed = inputValue.trim();
          if (!trimmed) return;
          
          // Add to array if not already present
          if (!value.includes(trimmed)) {
            onChange(field.name, [...value, trimmed] as HyperparameterArrayValue);
          }
          setNumberInputs((prev) => ({ ...prev, [field.name]: "" }));
        };

        const handleRemoveValue = (val: string) => {
          onChange(
            field.name,
            value.filter((v) => v !== val) as HyperparameterArrayValue
          );
        };

        return (
          <div key={field.name} className="w-full">
            <Label className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-display mb-2 block">
              {field.label}
              <span className="text-white/60 font-normal text-sm ml-2">
                (default: {String(field.defaultValue ?? "none")})
              </span>
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) =>
                  setNumberInputs((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                placeholder="Enter value and press Enter"
                className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[14px] sm:text-[16px] placeholder:text-white/60 flex-1"
              />
              <button
                type="button"
                onClick={handleAddValue}
                className="h-[36px] sm:h-[40px] px-4 bg-[#006b4c] hover:bg-[#007d59] text-white text-sm font-display rounded"
              >
                Add
              </button>
            </div>
            {/* Show added values as chips */}
            {value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(value as string[]).map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1 bg-[#1175d5] text-white px-2 py-1 rounded text-sm"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(val)}
                      className="hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {error && (
              <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                {error}
              </p>
            )}
          </div>
        );
      }

      case "select": {
        // For select fields, show checkboxes for each option
        const toggleOption = (optionValue: string | number | boolean) => {
          if (value.includes(optionValue)) {
            onChange(
              field.name,
              value.filter((v) => v !== optionValue) as HyperparameterArrayValue
            );
          } else {
            onChange(field.name, [...value, optionValue] as HyperparameterArrayValue);
          }
        };

        return (
          <div key={field.name} className="w-full">
            <Label className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-display mb-2 block">
              {field.label}
              <span className="text-white/60 font-normal text-sm ml-2">
                (default: {String(field.defaultValue ?? "none")})
              </span>
            </Label>
            <div className="flex flex-wrap gap-3">
              {field.options?.map((option) => (
                <div
                  key={String(option.value)}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={`${field.name}-${String(option.value)}`}
                    checked={value.includes(option.value as string | number | boolean)}
                    onCheckedChange={() =>
                      toggleOption(option.value as string | number | boolean)
                    }
                    className="border-[#404040] data-[state=checked]:bg-[#1175d5] data-[state=checked]:border-[#1175d5]"
                  />
                  <Label
                    htmlFor={`${field.name}-${String(option.value)}`}
                    className="text-white text-sm font-display cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                {error}
              </p>
            )}
          </div>
        );
      }

      case "boolean": {
        // For boolean fields, show checkboxes for True and False
        const toggleOption = (boolValue: boolean) => {
          if (value.includes(boolValue)) {
            onChange(
              field.name,
              value.filter((v) => v !== boolValue) as HyperparameterArrayValue
            );
          } else {
            onChange(field.name, [...value, boolValue] as HyperparameterArrayValue);
          }
        };

        return (
          <div key={field.name} className="w-full">
            <Label className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-display mb-2 block">
              {field.label}
              <span className="text-white/60 font-normal text-sm ml-2">
                (default: {field.defaultValue === true ? "True" : field.defaultValue === false ? "False" : "none"})
              </span>
            </Label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${field.name}-true`}
                  checked={value.includes(true)}
                  onCheckedChange={() => toggleOption(true)}
                  className="border-[#404040] data-[state=checked]:bg-[#1175d5] data-[state=checked]:border-[#1175d5]"
                />
                <Label
                  htmlFor={`${field.name}-true`}
                  className="text-white text-sm font-display cursor-pointer"
                >
                  True
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${field.name}-false`}
                  checked={value.includes(false)}
                  onCheckedChange={() => toggleOption(false)}
                  className="border-[#404040] data-[state=checked]:bg-[#1175d5] data-[state=checked]:border-[#1175d5]"
                />
                <Label
                  htmlFor={`${field.name}-false`}
                  className="text-white text-sm font-display cursor-pointer"
                >
                  False
                </Label>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                {error}
              </p>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {fields.map(renderField)}
    </div>
  );
}

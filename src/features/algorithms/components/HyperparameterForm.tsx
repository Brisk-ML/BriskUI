import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type {
  HyperparameterField,
  HyperparameterValue,
  HyperparameterValues,
} from "../types";

interface HyperparameterFormProps {
  fields: HyperparameterField[];
  values: HyperparameterValues;
  onChange: (name: string, value: HyperparameterValue) => void;
  errors?: Record<string, string>;
}

export function HyperparameterForm({
  fields,
  values,
  onChange,
  errors = {},
}: HyperparameterFormProps) {
  const renderField = (field: HyperparameterField) => {
    const value = values[field.name] ?? field.defaultValue;
    const error = errors[field.name];

    switch (field.type) {
      case "text":
      case "number":
        return (
          <div key={field.name} className="w-full sm:w-[180px] lg:w-[200px]">
            <Label className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-['Montserrat'] mb-2 block">
              {field.label}
            </Label>
            <Input
              type={field.type}
              value={value != null ? String(value) : ""}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (field.type === "number") {
                  // Allow empty string for clearing, otherwise try to parse as number
                  if (inputValue === "") {
                    onChange(field.name, "");
                  } else {
                    const numValue = Number(inputValue);
                    onChange(
                      field.name,
                      Number.isNaN(numValue) ? inputValue : numValue,
                    );
                  }
                } else {
                  onChange(field.name, inputValue);
                }
              }}
              placeholder={field.placeholder}
              className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px] placeholder:text-white/60"
            />
            {error && (
              <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                {error}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="w-full sm:w-[180px] lg:w-[200px]">
            <Label className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-['Montserrat'] mb-2 block">
              {field.label}
            </Label>
            <Select
              value={String(value)}
              onValueChange={(val) => {
                // Find the option object to get the original value type (not just string)
                const option = field.options?.find(
                  (opt) => String(opt.value) === val,
                );
                if (option) {
                  onChange(field.name, option.value);
                }
              }}
            >
              <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] w-full sm:w-[140px] lg:w-[150px] text-[16px] sm:text-[18px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#282828] border-[#404040]">
                {field.options?.map((option) => (
                  <SelectItem
                    key={String(option.value)}
                    value={String(option.value)}
                    className="text-white"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                {error}
              </p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div key={field.name} className="w-full sm:w-[180px] lg:w-[200px]">
            <Label className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-['Montserrat'] mb-2 block">
              {field.label}
            </Label>
            <Select
              value={String(value)}
              onValueChange={(val) => onChange(field.name, val === "true")}
            >
              <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] w-full sm:w-[140px] lg:w-[150px] text-[16px] sm:text-[18px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#282828] border-[#404040]">
                <SelectItem value="true" className="text-white">
                  True
                </SelectItem>
                <SelectItem value="false" className="text-white">
                  False
                </SelectItem>
              </SelectContent>
            </Select>
            {error && (
              <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                {error}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-3 sm:gap-y-4">
      {fields.map(renderField)}
    </div>
  );
}

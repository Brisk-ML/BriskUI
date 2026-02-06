import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
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
    const defaultLabel =
      field.defaultValue != null && field.defaultValue !== ""
        ? ` (default: ${field.defaultValue})`
        : "";

    switch (field.type) {
      case "text":
      case "number":
        return (
          <div key={field.name} className="w-full">
            <Label className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-display mb-2 block">
              {field.label}
              {defaultLabel && (
                <span className="text-white/60 font-normal text-sm ml-2">
                  {defaultLabel}
                </span>
              )}
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
              placeholder={
                field.defaultValue != null && field.defaultValue !== ""
                  ? `Default: ${field.defaultValue}`
                  : field.placeholder
              }
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
          <div key={field.name} className="w-full">
            <Label className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-display mb-2 block">
              {field.label}
              {defaultLabel && (
                <span className="text-white/60 font-normal text-sm ml-2">
                  {defaultLabel}
                </span>
              )}
            </Label>
            <HoverSelect
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
              options={
                field.options?.map((option) => ({
                  value: String(option.value),
                  label: option.label,
                })) ?? []
              }
              triggerClassName="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] w-full sm:w-[200px] text-[16px] sm:text-[18px]"
            />
            {error && (
              <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                {error}
              </p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div key={field.name} className="w-full">
            <Label className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-display mb-2 block">
              {field.label}
              {defaultLabel && (
                <span className="text-white/60 font-normal text-sm ml-2">
                  {defaultLabel}
                </span>
              )}
            </Label>
            <HoverSelect
              value={String(value)}
              onValueChange={(val) => onChange(field.name, val === "true")}
              options={[
                { value: "true", label: "True" },
                { value: "false", label: "False" },
              ]}
              triggerClassName="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] w-full sm:w-[200px] text-[16px] sm:text-[18px]"
            />
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
    <div className="flex flex-col gap-3 sm:gap-4">
      {fields.map(renderField)}
    </div>
  );
}

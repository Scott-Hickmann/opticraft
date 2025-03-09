'use client';

import {
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';

export interface NumberInputProps {
  label: string;
  value: number;
  decimalPlaces: number;
  onChange?: (value: number) => void;
  min?: number;
  step?: number;
}

export function NumberInput({
  label,
  value,
  decimalPlaces,
  min,
  step,
  onChange
}: NumberInputProps) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <div className="flex items-center gap-2 w-full">
          <span className="min-w-[16px]">{label}</span>
          <input
            type="number"
            min={min}
            step={step}
            value={value.toFixed(decimalPlaces)}
            onChange={(e) => {
              const value = parseFloat(e.target.value || '0') || 0;
              onChange?.(value);
            }}
            className="flex-1 px-2 py-1 text-sm bg-transparent border-none outline-none min-w-0"
          />
        </div>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

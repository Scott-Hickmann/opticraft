'use client';

import { ChevronRight, type LucideIcon, Trash2 } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector3Item {
  name: string;
  vector: Vector3;
  icon?: LucideIcon;
}

export function TransformSection({
  items,
  onVectorChange,
  onRemove
}: {
  items: Vector3Item[];
  onVectorChange?: (name: string, axis: 'x' | 'y' | 'z', value: number) => void;
  onRemove?: () => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        <span>Transform</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Remove object"
          >
            <Trash2 size={14} />
            <span>Remove</span>
          </button>
        )}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.name}
            asChild
            defaultOpen={true}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.name}
                  className="cursor-pointer"
                >
                  {item.icon && <item.icon />}
                  <span>{item.name}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {(['x', 'y', 'z'] as const).map((axis) => (
                    <SidebarMenuSubItem key={`${item.name}-${axis}`}>
                      <SidebarMenuSubButton asChild>
                        <div className="flex items-center gap-2 w-full">
                          <span className="min-w-[16px]">
                            {axis.toUpperCase()}
                          </span>
                          <input
                            type="number"
                            value={item.vector[axis].toFixed(6)}
                            onChange={(e) => {
                              const value =
                                parseFloat(e.target.value || '0') || 0;
                              onVectorChange?.(item.name, axis, value);
                            }}
                            className="flex-1 px-2 py-1 text-sm bg-transparent border-none outline-none min-w-0"
                          />
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

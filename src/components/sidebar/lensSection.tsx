'use client';

import { ChevronRight, Search as LensIcon } from 'lucide-react';

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
  SidebarMenuSub
} from '@/components/ui/sidebar';

import { NumberInput } from './numberInput';

export interface LensProps {
  r1: number;
  r2: number;
  ior: number;
  height: number;
  thickness: number;
  onChange?: (
    prop: 'r1' | 'r2' | 'ior' | 'height' | 'thickness',
    value: number
  ) => void;
}

export function LensSection({
  r1,
  r2,
  ior,
  height,
  thickness,
  onChange
}: LensProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        <span>Lens</span>
      </SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Lens" className="cursor-pointer">
                <LensIcon />
                <span>Lens</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <NumberInput
                  label="IOR"
                  value={ior}
                  decimalPlaces={2}
                  min={1}
                  step={0.1}
                  onChange={(value) => onChange?.('ior', value)}
                />
                <NumberInput
                  label="R1"
                  value={r1}
                  decimalPlaces={2}
                  step={0.1}
                  onChange={(value) => onChange?.('r1', value)}
                />
                <NumberInput
                  label="R2"
                  value={r2}
                  decimalPlaces={2}
                  step={0.1}
                  onChange={(value) => onChange?.('r2', value)}
                />
                <NumberInput
                  label="Diameter"
                  value={height}
                  decimalPlaces={2}
                  step={0.1}
                  onChange={(value) => onChange?.('height', value)}
                />
                <NumberInput
                  label="Thickness"
                  value={thickness}
                  decimalPlaces={2}
                  step={0.1}
                  onChange={(value) => onChange?.('thickness', value)}
                />
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}

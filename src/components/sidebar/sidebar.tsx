'use client';

import { Move3D, Rotate3D, Scale3D } from 'lucide-react';
import * as React from 'react';
import * as THREE from 'three';

import { useStore } from '@/components/store';
import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';

import { TransformSection, Vector3Item } from './transformSection';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { active, getComponent, updateComponent, removeComponent } = useStore();
  const activeComponent = active ? getComponent(active) : null;

  const handleVectorChange = (
    name: string,
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    if (!activeComponent) return;

    const updates: Partial<typeof activeComponent.props> = {};
    const { position, rotation, scale } = activeComponent.props;

    switch (name) {
      case 'Position':
        updates.position = new THREE.Vector3(
          axis === 'x' ? value : (position?.x ?? 0),
          axis === 'y' ? value : (position?.y ?? 0),
          axis === 'z' ? value : (position?.z ?? 0)
        );
        break;
      case 'Orientation':
        updates.rotation = new THREE.Euler(
          ((axis === 'x' ? value : ((rotation?.x ?? 0) * 180) / Math.PI) *
            Math.PI) /
            180,
          ((axis === 'y' ? value : ((rotation?.y ?? 0) * 180) / Math.PI) *
            Math.PI) /
            180,
          ((axis === 'z' ? value : ((rotation?.z ?? 0) * 180) / Math.PI) *
            Math.PI) /
            180
        );
        break;
      case 'Scale':
        updates.scale = new THREE.Vector3(
          axis === 'x' ? value : (scale?.x ?? 1),
          axis === 'y' ? value : (scale?.y ?? 1),
          axis === 'z' ? value : (scale?.z ?? 1)
        );
        break;
    }

    updateComponent(activeComponent.key, {
      ...activeComponent,
      props: {
        ...activeComponent.props,
        ...updates
      }
    });
  };

  const handleRemoveComponent = () => {
    if (active) {
      removeComponent(active);
    }
  };

  // Get current values from active component
  const currentVectors: Vector3Item[] | null = React.useMemo(() => {
    if (!activeComponent) return null;

    const { position, rotation, scale } = activeComponent.props;

    return [
      {
        name: 'Position',
        icon: Move3D,
        vector: {
          x: position?.x ?? 0,
          y: position?.y ?? 0,
          z: position?.z ?? 0
        }
      },
      {
        name: 'Orientation',
        icon: Rotate3D,
        vector: {
          x: ((rotation?.x ?? 0) * 180) / Math.PI,
          y: ((rotation?.y ?? 0) * 180) / Math.PI,
          z: ((rotation?.z ?? 0) * 180) / Math.PI
        }
      },
      {
        name: 'Scale',
        icon: Scale3D,
        vector: {
          x: scale?.x ?? 1,
          y: scale?.y ?? 1,
          z: scale?.z ?? 1
        }
      }
    ];
  }, [activeComponent]);

  return (
    <Sidebar side="right" collapsible="icon" {...props}>
      <SidebarContent>
        <SidebarHeader className="h-16 justify-center">
          <div className="pl-2 font-semibold text-lg">Editor</div>
        </SidebarHeader>
        {currentVectors ? (
          <TransformSection
            items={currentVectors}
            onVectorChange={handleVectorChange}
            onRemove={active ? handleRemoveComponent : undefined}
          />
        ) : (
          <SidebarGroupLabel className="pl-4">
            No objects selected
          </SidebarGroupLabel>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

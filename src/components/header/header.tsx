'use client';

import {
  ArrowUpFromDot as RayIcon,
  FlipHorizontal as MirrorIcon,
  Search as LensIcon,
  Split as BeamSplitterIcon,
  SquareX as BeamBlockIcon
} from 'lucide-react';

import { ComponentType, getNewComponent } from '@/components/component';
import { useStore } from '@/components/store';

export const HeaderItem = ({
  label,
  type,
  icon: Icon
}: {
  label: string;
  type: ComponentType;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  const { addComponent } = useStore();

  const getBorderClass = () => {
    switch (type) {
      case 'beamBlock':
        return 'border-2 border-[var(--color-beam-block)]';
      case 'mirror':
        return 'border-2 border-[var(--color-mirror)]';
      case 'ray':
        return 'border-2 border-[var(--color-ray)]';
      case 'beamSplitter':
        return 'border-2 border-[var(--color-beam-splitter)]';
      case 'lens':
        return 'border-2 border-[var(--color-lens)]';
      default:
        return '';
    }
  };

  return (
    <button
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800 ${getBorderClass()}`}
      onClick={() => addComponent(getNewComponent(type))}
      title={`Add ${label}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
};

export const Header = () => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4 bg-white dark:bg-gray-950">
      <div className="mr-4 font-semibold text-lg">OptiCraft</div>
      <div className="flex items-center justify-center gap-1 flex-1">
        <HeaderItem label="Beam Block" type="beamBlock" icon={BeamBlockIcon} />
        <HeaderItem label="Mirror" type="mirror" icon={MirrorIcon} />
        <HeaderItem label="Ray" type="ray" icon={RayIcon} />
        <HeaderItem
          label="Beam Splitter"
          type="beamSplitter"
          icon={BeamSplitterIcon}
        />
        <HeaderItem label="Lens" type="lens" icon={LensIcon} />
      </div>
    </header>
  );
};

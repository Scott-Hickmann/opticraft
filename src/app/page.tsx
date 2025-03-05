import { CanvasScene } from '@/components/scene';
import { StoreProvider } from '@/components/store';

export default function Home() {
  return (
    <StoreProvider>
      <CanvasScene />
    </StoreProvider>
  );
}

import { Header } from '@/components/header';
import { CanvasScene } from '@/components/scene';
import { AppSidebar } from '@/components/sidebar';
import { StoreProvider } from '@/components/store';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <StoreProvider>
      <SidebarProvider>
        <SidebarInset>
          <Header />
          <CanvasScene />
        </SidebarInset>
        <AppSidebar />
      </SidebarProvider>
    </StoreProvider>
  );
}

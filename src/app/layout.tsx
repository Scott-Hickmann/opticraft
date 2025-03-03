import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OptiCraft',
  description: 'OptiCraft is an optics lenses simulation software.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

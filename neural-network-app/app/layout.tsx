import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Neuronal de Aprendizaje',
  description: 'Sistema interactivo de aprendizaje basado en red neuronal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

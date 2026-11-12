// Root application layout and workspace metadata.
import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Taskspace · Your work, in order', description: 'A calm workspace to organize tasks and keep work moving.' };
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }


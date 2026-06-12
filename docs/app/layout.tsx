import '@/app/global.css';
import 'dialkit/styles.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { DialRoot } from 'dialkit';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          {children}
          <DialRoot />
        </RootProvider>
      </body>
    </html>
  );
}

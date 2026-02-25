import type { Metadata } from 'next';
import './globals.css';
import { ClientSideToaster } from "@/components/client-side-toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import { Provider as BalancerProvider } from 'react-wrap-balancer';
import ClickSpark from '@/components/ui/click-spark';

export const metadata: Metadata = {
  title: 'DeciMind',
  description: 'A helpful AI assistant.',
  icons: {
    icon: 'https://res.cloudinary.com/dhw6yweku/image/upload/v1758440741/Gemini_Generated_Image_27zxt327zxt327zx-removebg-preview_evmvx3.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <BalancerProvider>
              <ClickSpark
                sparkColor='#fff'
                sparkSize={10}
                sparkRadius={15}
                sparkCount={8}
                duration={400}
              >
                {children}
              </ClickSpark>
            </BalancerProvider>
          </AuthProvider>
          <ClientSideToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

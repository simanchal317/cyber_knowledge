import './globals.css';

export const metadata = {
  title: 'RANGE // Offensive Security Practice Console & Drill Platform',
  description: 'A full-stack offensive security drill book, CTF reference, protocol exploitation matrix, and interactive practice machines platform with live shared state across users.',
  keywords: ['Offensive Security', 'CTF', 'Penetration Testing', 'Privilege Escalation', 'Cheat Sheet', 'Ethical Hacking'],
  authors: [{ name: 'Security Research Team' }]
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

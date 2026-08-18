import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Coursegraph — Course & Prerequisite Planner',
  description: 'Explore courses, prerequisite chains, and personalised next-course recommendations, backed by a graph database.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-parchment font-body min-h-screen bg-grain">
        <Header />
        <main className="max-w-6xl mx-auto px-6 pb-24">{children}</main>
      </body>
    </html>
  );
}

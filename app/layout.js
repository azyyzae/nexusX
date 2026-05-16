export const metadata = {
  title: "Nexus X",
  description: "Nexus X website",
  icons: {
    icon: "/assets/icon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/icon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'monospace' }}>
        {children}
      </body>
    </html>
  );
}

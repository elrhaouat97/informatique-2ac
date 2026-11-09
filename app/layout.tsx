import type { Metadata } from "next";
import "./globals.css";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "informatique-2ac-15-seances";
const basePath = process.env.GITHUB_ACTIONS === "true" ? `/${repositoryName}` : "";

export const metadata: Metadata = {
  title: "LAB·2AC — 15 séances d’informatique",
  description:
    "Parcours pratique d’informatique pour la 2AC : 15 séances de 2 heures, guidage grand débutant, photos réelles, ateliers en binôme et traces essentielles.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}

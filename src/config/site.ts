export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Marcador Kenshukan",
  description: "Sistema de puntuación para competencias de Karate Do",
  navItems: [
    {
      label: "Inicio",
      href: "/inicio",
    },
    {
      label: "Kata",
      href: "/kata",
    },
    {
      label: "Kumite",
      href: "/kumite",
    },
  ],
};

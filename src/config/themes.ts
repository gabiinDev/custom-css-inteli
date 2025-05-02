export interface Theme {
  name: string;
  url: string;
  description: string;
}

export interface ThemeConfig {
  [key: string]: Theme;
}

/**
 * Configuración de temas disponibles con sus URLs de CDN
 */
export const themes: ThemeConfig = {
  gss: {
    name: "Grupo Sancor Seguros",
    url: "https://natalfwk.gruposancorseguros.com/2.3.2/nf.min.css",
    description: "Recursos para aplicaciones internas del Grupo Sancor Seguros",
  },
  prevenet: {
    name: "Prevenet",
    url: "https://natalfwk.gruposancorseguros.com/2.3.2/nf-pnet.min.css",
    description: "Recursos exclusivos para Prevenet",
  },
  intermediarios: {
    name: "Intermediarios",
    url: "https://natalfwk.gruposancorseguros.com/2.3.2/nf-int.min.css",
    description: "Recursos exclusivos para aplicaciones de Intermediarios",
  },
  clipresta: {
    name: "Clientes y Prestadores",
    url: "https://natalfwk.gruposancorseguros.com/2.3.2/nf-cli.min.css",
    description:
      "Recursos exclusivos para aplicaciones de Clientes y Prestadores de Sancor Seguros",
  },
  psalud: {
    name: "Prevención Salud",
    url: "https://natalfwk.gruposancorseguros.com/2.3.2/nf-ps.min.css",
    description: "Recursos exclusivos para Prevención Salud",
  },
};

/**
 * Tema por defecto
 */
export const DEFAULT_THEME = "gss";

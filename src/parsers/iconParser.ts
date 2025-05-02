import * as fs from "fs";
import { Icon } from "../models/icon";

/**
 * Parser para extraer información de iconos desde archivos CSS
 */
export class IconParser {
  private cssContent: string;

  /**
   * @param cssFilePath Ruta al archivo CSS
   */
  constructor(private cssFilePath: string) {
    try {
      this.cssContent = fs.readFileSync(cssFilePath, "utf-8");
    } catch (error) {
      console.error(`Error al leer el archivo CSS: ${error}`);
      this.cssContent = "";
    }
  }

  /**
   * Extrae todos los iconos del archivo CSS
   * @returns Array de objetos Icon
   */
  parseIcons(): Icon[] {
    if (!this.cssContent) {
      return [];
    }

    const icons: Icon[] = [];

    // Buscar patrones como ".fa-user:before { content: "\f007"; }"
    const iconRegex =
      /\.fa-([a-zA-Z0-9-]+):before\s*{\s*content:\s*"(\\[a-fA-F0-9]+)"\s*;?\s*}/g;
    let match;

    while ((match = iconRegex.exec(this.cssContent)) !== null) {
      const iconName = `fa-${match[1]}`;
      const unicode = match[2];

      const icon = new Icon(iconName, unicode);
      icons.push(icon);
    }

    // También buscar patrones como ".fa-user:before,.fa-users:before { content: "\f007"; }"
    const multiIconRegex =
      /\.fa-([a-zA-Z0-9-]+):before(?:\s*,\s*\.fa-([a-zA-Z0-9-]+):before)*\s*{\s*content:\s*"(\\[a-fA-F0-9]+)"\s*;?\s*}/g;

    while ((match = multiIconRegex.exec(this.cssContent)) !== null) {
      // El primer grupo es el primer nombre de icono
      const iconName = `fa-${match[1]}`;

      // Verificar si este icono ya existe en nuestra lista
      if (!icons.some((icon) => icon.name === iconName)) {
        const unicode = match[3]; // El tercer grupo es el código unicode
        const icon = new Icon(iconName, unicode);
        icons.push(icon);
      }

      // Si hay más grupos (otros nombres de iconos), procesarlos también
      if (match[2]) {
        const additionalIconName = `fa-${match[2]}`;

        // Verificar si este icono ya existe en nuestra lista
        if (!icons.some((icon) => icon.name === additionalIconName)) {
          const unicode = match[3]; // El tercer grupo es el código unicode
          const icon = new Icon(additionalIconName, unicode);
          icons.push(icon);
        }
      }
    }

    return icons;
  }

  /**
   * Agrupa los iconos por categorías
   * @param icons Lista de iconos a agrupar
   * @returns Mapa de categoría a lista de iconos
   */
  categorizeIcons(icons: Icon[]): Map<string, Icon[]> {
    const categories = new Map<string, Icon[]>();

    // Categorías predefinidas basadas en prefijos comunes
    const categoriesMapping: Record<string, string[]> = {
      Navegación: ["arrow", "chevron", "caret", "angle", "nav", "menu"],
      Acciones: ["edit", "delete", "remove", "add", "create", "save", "cancel"],
      Usuario: ["user", "person", "profile", "account"],
      Comunicación: ["comment", "mail", "envelope", "chat", "message"],
      Contenido: ["file", "document", "image", "photo", "video"],
      Dispositivos: ["mobile", "tablet", "desktop", "phone"],
      Estado: ["check", "warning", "error", "info", "success"],
      "E-commerce": ["cart", "shop", "store", "product", "money"],
      Miscelánea: ["*"], // Categoría por defecto
    };

    // Inicializar categorías
    Object.keys(categoriesMapping).forEach((category) => {
      categories.set(category, []);
    });

    // Asignar iconos a categorías
    icons.forEach((icon) => {
      let assigned = false;

      for (const [category, prefixes] of Object.entries(categoriesMapping)) {
        if (category === "Miscelánea") {
          continue; // Saltarse la categoría por defecto
        }

        for (const prefix of prefixes) {
          if (icon.getBaseName().includes(prefix)) {
            categories.get(category)?.push(icon);
            assigned = true;
            break;
          }
        }

        if (assigned) {
          break;
        }
      }

      // Si no se asignó a ninguna categoría, ponerlo en Miscelánea
      if (!assigned) {
        categories.get("Miscelánea")?.push(icon);
      }
    });

    return categories;
  }
}

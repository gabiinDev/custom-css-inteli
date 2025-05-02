import * as fs from "fs";
import { CssClass } from "../models/cssClass";
import { CssProperty } from "../models/cssProperty";

/**
 * Parser para extraer información de los archivos CSS
 */
export class CssParser {
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
   * Extrae todas las clases CSS del archivo
   * @returns Array de objetos CssClass
   */
  parseClasses(): CssClass[] {
    if (!this.cssContent) {
      return [];
    }

    // Usaremos un mapa para agrupar clases por nombre
    const classMap = new Map<string, CssClass>();

    // Regex mejorado para capturar selectores más complejos
    // Captura el selector completo, incluyendo clases con contexto
    const selectorRegex = /([^{]+)\{([^}]*)\}/g;
    let selectorMatch;

    while ((selectorMatch = selectorRegex.exec(this.cssContent)) !== null) {
      const selector = selectorMatch[1].trim();
      const propertiesString = selectorMatch[2];

      // Extraer clases individuales del selector
      this.extractClassesFromSelector(selector, propertiesString, classMap);
    }

    // Convertir el mapa a un array
    return Array.from(classMap.values());
  }

  /**
   * Extrae clases individuales de un selector complejo
   * @param selector Selector CSS completo
   * @param propertiesString Cadena con las propiedades CSS
   * @param classMap Mapa de clases para actualizar
   */
  private extractClassesFromSelector(
    selector: string,
    propertiesString: string,
    classMap: Map<string, CssClass>
  ): void {
    // Dividir selectores múltiples separados por comas
    const selectorParts = selector.split(",").map((part) => part.trim());

    for (const selectorPart of selectorParts) {
      // Extraer todas las clases del selector
      const classMatches = selectorPart.match(/\.([a-zA-Z0-9_-]+)/g);

      if (!classMatches) continue;

      // Procesar cada clase encontrada
      for (const classMatch of classMatches) {
        const className = classMatch.substring(1); // Eliminar el punto inicial

        // Ignorar clases que empiezan con números o tienen caracteres no válidos
        if (!/^[a-zA-Z_]/.test(className) || /[^\w-]/.test(className)) {
          continue;
        }

        // Obtener la clase existente o crear una nueva
        let cssClass: CssClass;
        if (classMap.has(className)) {
          cssClass = classMap.get(className)!;
        } else {
          cssClass = new CssClass(className);
          classMap.set(className, cssClass);
        }

        // Añadir contexto a la descripción si no es un selector simple
        if (
          selectorPart !== `.${className}` &&
          !cssClass.description.includes("Contexto:")
        ) {
          // Extraemos el contexto para la documentación
          let contextInfo = `Contexto: Este estilo también se aplica en: '${selectorPart}'`;

          if (cssClass.description) {
            cssClass.description += `\n${contextInfo}`;
          } else {
            cssClass.description = contextInfo;
          }
        }

        // Procesar propiedades
        this.processProperties(cssClass, propertiesString);
      }
    }
  }

  /**
   * Procesa las propiedades CSS y las añade a la clase
   * @param cssClass Clase CSS a la que añadir propiedades
   * @param propertiesString Cadena con las propiedades CSS
   */
  private processProperties(
    cssClass: CssClass,
    propertiesString: string
  ): void {
    const propertyRegex = /([a-zA-Z-]+)\s*:\s*([^;!]+)(\s*!important)?/g;
    let propertyMatch;

    while ((propertyMatch = propertyRegex.exec(propertiesString)) !== null) {
      const propertyName = propertyMatch[1].trim();
      const propertyValue = propertyMatch[2].trim();
      const isImportant = !!propertyMatch[3];

      // Comprobar si la propiedad ya existe
      const existingProperty = cssClass.properties.find(
        (p) => p.name === propertyName
      );

      if (existingProperty) {
        // Si la nueva propiedad es !important o la existente no lo es, actualizamos
        if (isImportant || !existingProperty.important) {
          existingProperty.value = propertyValue;
          existingProperty.important = isImportant;
        }
      } else {
        // Añadir nueva propiedad
        const property = new CssProperty(
          propertyName,
          propertyValue,
          isImportant
        );
        cssClass.addProperty(property);
      }
    }
  }

  /**
   * Extrae todos los colores utilizados en el CSS
   * @returns Mapa de nombre de color a valor hexadecimal
   */
  parseColors(): Map<string, string> {
    if (!this.cssContent) {
      return new Map();
    }

    const colors = new Map<string, string>();

    // Coincidencias hexadecimales (por ejemplo, #fff, #ffffff)
    const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    let hexMatch;

    while ((hexMatch = hexRegex.exec(this.cssContent)) !== null) {
      const hex = hexMatch[0];
      colors.set(hex, hex);
    }

    // Coincidencias rgb/rgba (por ejemplo, rgb(255, 255, 255), rgba(255, 255, 255, 0.5))
    const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g;
    let rgbMatch;

    while ((rgbMatch = rgbRegex.exec(this.cssContent)) !== null) {
      const rgb = rgbMatch[0];
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);

      // Convertir a hex para almacenar
      const hex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      colors.set(rgb, hex);
    }

    // Coincidencias de nombres de colores (por ejemplo, white, black, red)
    const namedColorRegex =
      /:\s*(black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua)\b/g;
    let namedColorMatch;

    while ((namedColorMatch = namedColorRegex.exec(this.cssContent)) !== null) {
      const colorName = namedColorMatch[1];
      colors.set(colorName, this.getHexForNamedColor(colorName));
    }

    return colors;
  }

  /**
   * Convierte un nombre de color a su valor hexadecimal
   * @param colorName Nombre del color
   * @returns Valor hexadecimal
   */
  private getHexForNamedColor(colorName: string): string {
    const colorMap: Record<string, string> = {
      black: "#000000",
      silver: "#c0c0c0",
      gray: "#808080",
      white: "#ffffff",
      maroon: "#800000",
      red: "#ff0000",
      purple: "#800080",
      fuchsia: "#ff00ff",
      green: "#008000",
      lime: "#00ff00",
      olive: "#808000",
      yellow: "#ffff00",
      navy: "#000080",
      blue: "#0000ff",
      teal: "#008080",
      aqua: "#00ffff",
    };

    return colorMap[colorName] || "#000000";
  }
}

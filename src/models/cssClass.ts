import { CssProperty } from "./cssProperty";

/**
 * Representa una clase CSS con sus propiedades y metadatos
 */
export class CssClass {
  /**
   * @param name Nombre de la clase CSS (sin el punto)
   * @param properties Propiedades CSS de la clase
   * @param description Descripción opcional de la clase
   */
  constructor(
    public name: string,
    public properties: CssProperty[] = [],
    public description: string = ""
  ) {}

  /**
   * Añade una propiedad a la clase CSS
   * @param property Propiedad a añadir
   */
  addProperty(property: CssProperty): void {
    this.properties.push(property);
  }

  /**
   * Comprueba si la clase tiene una propiedad específica
   * @param propertyName Nombre de la propiedad a buscar
   * @returns true si la propiedad existe
   */
  hasProperty(propertyName: string): boolean {
    return this.properties.some((p) => p.name === propertyName);
  }

  /**
   * Obtiene el valor de una propiedad específica
   * @param propertyName Nombre de la propiedad
   * @returns Valor de la propiedad o undefined si no existe
   */
  getPropertyValue(propertyName: string): string | undefined {
    const property = this.properties.find((p) => p.name === propertyName);
    return property ? property.value : undefined;
  }

  /**
   * Convierte la clase CSS a texto CSS válido
   * @returns Representación de texto de la clase CSS
   */
  toCssString(): string {
    if (this.properties.length === 0) {
      return `.${this.name} {}`;
    }

    const propertiesString = this.properties
      .map((p) => `  ${p.name}: ${p.value};`)
      .join("\n");

    return `.${this.name} {\n${propertiesString}\n}`;
  }
}

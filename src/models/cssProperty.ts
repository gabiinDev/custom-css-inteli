/**
 * Representa una propiedad CSS con su nombre y valor
 */
export class CssProperty {
  /**
   * @param name Nombre de la propiedad CSS (ej: "color", "font-size")
   * @param value Valor de la propiedad CSS (ej: "#fff", "16px")
   * @param important Indica si la propiedad tiene el flag !important
   */
  constructor(
    public name: string,
    public value: string,
    public important: boolean = false
  ) {}

  /**
   * Convierte la propiedad a texto CSS válido
   * @returns Representación de texto de la propiedad CSS
   */
  toString(): string {
    return `${this.name}: ${this.value}${this.important ? " !important" : ""};`;
  }

  /**
   * Clona la propiedad CSS
   * @returns Una nueva instancia de CssProperty con los mismos valores
   */
  clone(): CssProperty {
    return new CssProperty(this.name, this.value, this.important);
  }
}

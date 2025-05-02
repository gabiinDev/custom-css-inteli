/**
 * Representa un icono de FontAwesome
 */
export class Icon {
  /**
   * @param name Nombre del icono (ej: "fa-user")
   * @param unicode Código unicode del icono (ej: "\f007")
   * @param categories Categorías a las que pertenece el icono
   */
  constructor(
    public name: string,
    public unicode: string,
    public categories: string[] = []
  ) {}

  /**
   * Obtiene el nombre del icono sin el prefijo "fa-"
   * @returns Nombre sin prefijo
   */
  getBaseName(): string {
    return this.name.startsWith("fa-") ? this.name.substring(3) : this.name;
  }

  /**
   * Obtiene el HTML para mostrar el icono
   * @returns Elemento HTML para mostrar el icono
   */
  toHtml(): string {
    return `<i class="fa ${this.name}"></i>`;
  }

  /**
   * Obtiene el CSS para mostrar el icono
   * @returns CSS para mostrar el icono
   */
  toCss(): string {
    return `
.${this.name}:before {
    content: "${this.unicode}";
}`;
  }
}

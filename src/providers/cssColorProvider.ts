import * as vscode from "vscode";

/**
 * Proveedor de autocompletado para colores CSS
 */
export class CssColorProvider
  implements vscode.CompletionItemProvider, vscode.DocumentColorProvider
{
  /**
   * @param colors Mapa de nombres de colores a valores hexadecimales
   */
  constructor(private colors: Map<string, string>) {}

  /**
   * Implementación del método provideCompletionItems de CompletionItemProvider
   */
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    const linePrefix = document
      .lineAt(position)
      .text.substr(0, position.character);

    // Determinar si estamos en un contexto donde autocompletar colores
    const inColorContext =
      /(color|background|border|shadow)(\s*):(\s*)[\w#]*$/.test(linePrefix);

    if (!inColorContext) {
      return undefined;
    }

    // Crear elementos de autocompletado para cada color
    const items: vscode.CompletionItem[] = [];

    this.colors.forEach((hexValue, colorName) => {
      const item = new vscode.CompletionItem(
        colorName,
        vscode.CompletionItemKind.Color
      );

      item.detail = `NF2 • ${hexValue}`;
      item.documentation = new vscode.MarkdownString(
        this.createMarkdownForColor(colorName, hexValue)
      );

      // Decoración para mostrar un cuadrado de color
      item.kind = vscode.CompletionItemKind.Color;

      // Añadir un filtro de texto para mejorar la búsqueda
      item.filterText = `nf2 color ${colorName} ${hexValue}`;

      // Establecer mayor prioridad para aparecer antes en la lista
      item.sortText = `0000${colorName}`;

      items.push(item);
    });

    return items;
  }

  /**
   * Crea un string de markdown con información del color
   * @param colorName Nombre del color
   * @param hexValue Valor hexadecimal
   * @returns Markdown formateado
   */
  private createMarkdownForColor(colorName: string, hexValue: string): string {
    const markdown = new vscode.MarkdownString();

    markdown.appendMarkdown(`### NF2 Style Intellisense\n\n`);
    markdown.appendMarkdown(`**Color:** \`${colorName}\`\n\n`);
    markdown.appendMarkdown(`**Hex:** \`${hexValue}\`\n\n`);

    // Mostrar una vista previa del color
    markdown.appendMarkdown(
      `<div style="background-color: ${hexValue}; width: 100%; height: 20px; margin: 10px 0;"></div>\n\n`
    );

    // Agregar ejemplos de uso
    markdown.appendMarkdown(`**CSS Example:**\n\n`);
    markdown.appendCodeblock(
      `.element {\n  color: ${hexValue};\n  background-color: ${hexValue};\n}`,
      "css"
    );

    // Agregar pie de documentación con referencia a la extensión
    markdown.appendMarkdown(
      `\n---\n*Proporcionado por NF2 Style Intellisense*`
    );

    return markdown.value;
  }

  /**
   * Implementación del método provideDocumentColors de DocumentColorProvider
   */
  provideDocumentColors(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.ColorInformation[]> {
    const text = document.getText();
    const colorInfos: vscode.ColorInformation[] = [];

    // Buscar hexadecimales (#fff, #ffffff)
    const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    let match;

    while ((match = hexRegex.exec(text)) !== null) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      const color = this.parseHexColor(match[0]);
      if (color) {
        colorInfos.push(new vscode.ColorInformation(range, color));
      }
    }

    // Buscar rgb/rgba
    const rgbRegex =
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/g;

    while ((match = rgbRegex.exec(text)) !== null) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      const r = parseInt(match[1], 10) / 255;
      const g = parseInt(match[2], 10) / 255;
      const b = parseInt(match[3], 10) / 255;
      const a = match[4] ? parseFloat(match[4]) : 1;

      const color = new vscode.Color(r, g, b, a);
      colorInfos.push(new vscode.ColorInformation(range, color));
    }

    return colorInfos;
  }

  /**
   * Implementación del método provideColorPresentations de DocumentColorProvider
   */
  provideColorPresentations(
    color: vscode.Color,
    context: { document: vscode.TextDocument; range: vscode.Range },
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.ColorPresentation[]> {
    const presentations: vscode.ColorPresentation[] = [];

    // Crear presentaciones en diferentes formatos
    const hex = this.rgbaToHex(
      color.red * 255,
      color.green * 255,
      color.blue * 255
    );
    const rgba = `rgba(${Math.round(color.red * 255)}, ${Math.round(
      color.green * 255
    )}, ${Math.round(color.blue * 255)}, ${color.alpha.toFixed(2)})`;
    const rgb = `rgb(${Math.round(color.red * 255)}, ${Math.round(
      color.green * 255
    )}, ${Math.round(color.blue * 255)})`;

    presentations.push(new vscode.ColorPresentation(hex));

    if (color.alpha < 1) {
      presentations.push(new vscode.ColorPresentation(rgba));
    } else {
      presentations.push(new vscode.ColorPresentation(rgb));
    }

    return presentations;
  }

  /**
   * Convierte un color hexadecimal a objeto Color de VSCode
   * @param hex Color hexadecimal (ej: "#fff" o "#ffffff")
   * @returns Objeto Color o undefined si el formato es inválido
   */
  private parseHexColor(hex: string): vscode.Color | undefined {
    hex = hex.toLowerCase();

    // Formato #rgb
    if (hex.length === 4) {
      const r = parseInt(hex[1] + hex[1], 16) / 255;
      const g = parseInt(hex[2] + hex[2], 16) / 255;
      const b = parseInt(hex[3] + hex[3], 16) / 255;
      return new vscode.Color(r, g, b, 1);
    }

    // Formato #rrggbb
    if (hex.length === 7) {
      const r = parseInt(hex.substr(1, 2), 16) / 255;
      const g = parseInt(hex.substr(3, 2), 16) / 255;
      const b = parseInt(hex.substr(5, 2), 16) / 255;
      return new vscode.Color(r, g, b, 1);
    }

    return undefined;
  }

  /**
   * Convierte componentes RGB a formato hexadecimal
   * @param r Componente rojo (0-255)
   * @param g Componente verde (0-255)
   * @param b Componente azul (0-255)
   * @returns Color en formato hexadecimal (#rrggbb)
   */
  private rgbaToHex(r: number, g: number, b: number): string {
    const componentToHex = (c: number) => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
  }
}

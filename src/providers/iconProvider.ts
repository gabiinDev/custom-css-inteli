import * as vscode from "vscode";
import { Icon } from "../models/icon";
import { detectHtmlElement } from "../utils/htmlUtils";
import { getCurrentThemeInfo } from "../utils/themeInfoUtils";

/**
 * Proveedor de autocompletado y hover para iconos
 */
export class IconProvider
  implements vscode.CompletionItemProvider, vscode.HoverProvider
{
  /**
   * @param icons Lista de iconos disponibles
   */
  constructor(private icons: Icon[]) {}

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

    // Determinar si estamos en un contexto donde autocompletar iconos
    const inIconContext =
      /class=["|'][\w\s-]*fa(-|\s+)$/.test(linePrefix) || // HTML class con fa-
      /className=["|'][\w\s-]*fa(-|\s+)$/.test(linePrefix) || // React className con fa-
      /\.fa-[\w-]*$/.test(linePrefix); // CSS selector fa-

    // Mejorado: También detectamos si estamos dentro de una etiqueta <i> con clases
    const isInITag =
      detectHtmlElement(document, position) === "i" &&
      (/class=["|'][\w\s-]*$/.test(linePrefix) ||
        /className=["|'][\w\s-]*$/.test(linePrefix));

    if (!inIconContext && !isInITag) {
      return undefined;
    }

    // Crear elementos de autocompletado para cada icono
    return this.icons.map((icon) => {
      const name = icon.getBaseName(); // Nombre sin el prefijo "fa-"
      const completionItem = new vscode.CompletionItem(
        name,
        vscode.CompletionItemKind.Value
      );

      completionItem.detail = `NF2 • Icon: fa-${name}`;
      completionItem.documentation = new vscode.MarkdownString(
        this.createMarkdownForIcon(icon)
      );

      // Añadir un filtro de texto para mejorar la búsqueda
      completionItem.filterText = `nf2 icon fa fa-${name}`;

      // Establecer prioridad basada en contexto
      if (isInITag) {
        // Si estamos dentro de un tag <i>, darle mayor prioridad
        completionItem.sortText = `0001${name}`;
      } else {
        // Prioridad normal para otros contextos
        completionItem.sortText = `0002${name}`;
      }

      // Determinar el texto de inserción según el contexto
      if (linePrefix.endsWith("fa-")) {
        // Si ya hay "fa-", solo insertar el nombre base
        completionItem.insertText = name;
      } else if (linePrefix.endsWith("fa ")) {
        // Si hay "fa ", insertar "fa-nombre"
        completionItem.insertText = `fa-${name}`;
      } else if (isInITag && !linePrefix.includes("fa")) {
        // Si estamos en <i> sin fa, insertar "fa fa-nombre"
        completionItem.insertText = `fa fa-${name}`;
      }

      return completionItem;
    });
  }

  /**
   * Implementación del método provideHover de HoverProvider
   */
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const wordRange = document.getWordRangeAtPosition(position, /fa-[\w-]+/);
    if (!wordRange) {
      return undefined;
    }

    const word = document.getText(wordRange);

    // Buscar el icono que coincida con la palabra
    const icon = this.icons.find(
      (i) => i.name === word || `fa-${i.getBaseName()}` === word
    );
    if (!icon) {
      return undefined;
    }

    // Crear el hover con información del icono
    const markdown = new vscode.MarkdownString(
      this.createMarkdownForIcon(icon)
    );
    return new vscode.Hover(markdown);
  }

  /**
   * Crea un string de markdown con información del icono
   * @param icon Icono
   * @returns Markdown formateado
   */
  private createMarkdownForIcon(icon: Icon): string {
    // Obtener información del tema actual
    const themeInfo = getCurrentThemeInfo();
    const scopeText =
      themeInfo.scope === "default" ? "" : ` (${themeInfo.scope})`;

    let markdown = `### NF2 Style Intellisense\n\n`;
    markdown += `**Tema actual:** ${themeInfo.name}${scopeText}\n\n`;
    markdown += `**Icon:** \`${icon.name}\`\n\n`;
    markdown += `**Unicode:** \`${icon.unicode}\`\n\n`;

    markdown += "**HTML Example:**\n\n```html\n";
    markdown += icon.toHtml();
    markdown += "\n```\n\n";

    markdown += "**CSS Example:**\n\n```css\n";
    markdown += icon.toCss();
    markdown += "\n```\n";

    // Agregar pie de documentación con referencia a la extensión y enlace a documentación
    markdown += `\n---\n*Proporcionado por NF2 Style Intellisense*\n\n`;
    markdown += `Para más información, visita la documentación oficial: [NF2 Documentation](https://ux.gruposancorseguros.com/#/nf2)`;

    return markdown;
  }
}

import * as vscode from "vscode";
import { CssClass } from "../models/cssClass";
import {
  detectHtmlElement,
  isClassRelevantForElement,
} from "../utils/htmlUtils";
import { getCurrentThemeInfo } from "../utils/themeInfoUtils";

/**
 * Proveedor de autocompletado y hover para clases CSS
 */
export class CssClassProvider
  implements vscode.CompletionItemProvider, vscode.HoverProvider
{
  /**
   * @param cssClasses Lista de clases CSS disponibles
   */
  constructor(private cssClasses: CssClass[]) {}

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

    // Determinar si estamos en un contexto donde autocompletar clases CSS
    const inClassContext =
      /class=["|'][\w\s-]*$/.test(linePrefix) || // HTML class attribute
      /className=["|'][\w\s-]*$/.test(linePrefix) || // React className
      /\.[\w-]*$/.test(linePrefix); // CSS selector

    if (!inClassContext) {
      return undefined;
    }

    // Detectar el tipo de elemento HTML actual
    const currentElementType = detectHtmlElement(document, position);

    // Crear elementos de autocompletado para cada clase CSS
    return this.cssClasses.map((cssClass) => {
      const completionItem = new vscode.CompletionItem(
        cssClass.name,
        vscode.CompletionItemKind.Class
      );

      completionItem.detail = `NF2 • ${
        cssClass.description || cssClass.properties.length + " propiedades"
      }`;

      // Usar la propiedad kind para establecer el tipo visual
      completionItem.kind = vscode.CompletionItemKind.Class;

      completionItem.documentation = new vscode.MarkdownString(
        this.createMarkdownForClass(cssClass)
      );

      // Añadir un filtro de texto para mejorar la búsqueda
      completionItem.filterText = `nf2 ${cssClass.name}`;

      // Establecer orden de aparición basado en la relevancia para el elemento HTML actual
      const isRelevant = isClassRelevantForElement(
        cssClass.name,
        currentElementType
      );

      // Si la clase es relevante para el elemento actual, le damos alta prioridad (aparece primero)
      // Si el elemento es <i>, destacamos especialmente las clases fa-
      if (currentElementType === "i" && cssClass.name.startsWith("fa-")) {
        completionItem.sortText = `0001${cssClass.name}`;
      } else if (isRelevant) {
        completionItem.sortText = `0002${cssClass.name}`;
      } else {
        completionItem.sortText = `0003${cssClass.name}`;
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
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return undefined;
    }

    const word = document.getText(wordRange);

    // Buscar la clase CSS que coincida con la palabra
    const cssClass = this.cssClasses.find((c) => c.name === word);
    if (!cssClass) {
      return undefined;
    }

    // Crear el hover con información de la clase
    const markdown = new vscode.MarkdownString(
      this.createMarkdownForClass(cssClass)
    );
    return new vscode.Hover(markdown);
  }

  /**
   * Crea un string de markdown con información de la clase CSS
   * @param cssClass Clase CSS
   * @returns Markdown formateado
   */
  private createMarkdownForClass(cssClass: CssClass): string {
    // Obtener información del tema actual
    const themeInfo = getCurrentThemeInfo();
    const scopeText =
      themeInfo.scope === "default" ? "" : ` (${themeInfo.scope})`;

    let markdown = `### NF2 Style Intellisense\n\n`;
    markdown += `**Tema actual:** ${themeInfo.name}${scopeText}\n\n`;
    markdown += `**Clase:** \`.${cssClass.name}\`\n\n`;

    if (cssClass.description) {
      markdown += `**Descripción:** ${cssClass.description}\n\n`;
    }

    if (cssClass.properties.length > 0) {
      markdown += "**Propiedades CSS:**\n\n```css\n";
      markdown += cssClass.toCssString();
      markdown += "\n```\n";
    }

    // Agregar pie de documentación con referencia a la extensión y enlace a documentación
    markdown += `\n---\n*Proporcionado por NF2 Style Intellisense*\n\n`;
    markdown += `Para más información, visita la documentación oficial: [NF2 Documentation](https://ux.gruposancorseguros.com/#/nf2)`;

    return markdown;
  }
}

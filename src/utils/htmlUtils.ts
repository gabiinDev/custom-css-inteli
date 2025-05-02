import * as vscode from "vscode";

/**
 * Utilidades para trabajar con elementos HTML
 */

/**
 * Detecta el tipo de elemento HTML en el que se está escribiendo
 * @param document Documento actual
 * @param position Posición actual del cursor
 * @returns El tipo de elemento HTML o undefined si no se detecta
 */
export function detectHtmlElement(
  document: vscode.TextDocument,
  position: vscode.Position
): string | undefined {
  // Obtener la línea actual y las anteriores para buscar contexto
  const currentLine = document.lineAt(position).text;

  // Buscar el último elemento de apertura antes de la posición actual
  const textBeforePosition = currentLine.substring(0, position.character);

  // Buscar el último elemento de apertura "<tag"
  const tagOpenRegex = /<([a-zA-Z][a-zA-Z0-9_:-]*)[^>]*$/;
  const match = textBeforePosition.match(tagOpenRegex);

  if (match) {
    return match[1].toLowerCase(); // Devolver el nombre del elemento en minúsculas
  }

  // Si no encontramos un elemento en la línea actual, buscamos en líneas anteriores
  let lineNumber = position.line - 1;
  let openTagFound = false;
  let lastTagName: string | undefined;

  while (lineNumber >= 0 && lineNumber >= position.line - 10 && !openTagFound) {
    const previousLine = document.lineAt(lineNumber).text;

    // Buscar todos los elementos de apertura y cierre en la línea
    const tagMatches = [
      ...previousLine.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9_:-]*)[^>]*>/g),
    ];

    for (let i = tagMatches.length - 1; i >= 0; i--) {
      const tagMatch = tagMatches[i];
      if (tagMatch[0].startsWith("</")) {
        // Es un cierre de etiqueta, ignoramos
        continue;
      } else {
        // Es una apertura de etiqueta
        openTagFound = true;
        lastTagName = tagMatch[1].toLowerCase();
        break;
      }
    }

    if (openTagFound) {
      break;
    }

    lineNumber--;
  }

  return lastTagName;
}

/**
 * Determina si una clase CSS es relevante para un tipo de elemento HTML
 * @param className Nombre de la clase CSS
 * @param elementType Tipo de elemento HTML
 * @returns true si la clase es relevante para el elemento
 */
export function isClassRelevantForElement(
  className: string,
  elementType?: string
): boolean {
  if (!elementType) {
    return false;
  }

  // Mapeo de elementos a prefijos de clase relevantes
  const elementClassMap: Record<string, string[]> = {
    i: ["fa-", "icon-", "material-icons"],
    li: ["list-", "item-", "nav-item"],
    ul: ["list-", "nav-", "menu-"],
    ol: ["list-", "ordered-"],
    a: ["link-", "btn-", "nav-link"],
    button: ["btn-", "button-"],
    img: ["img-", "image-"],
    table: ["table-", "grid-"],
    tr: ["row-", "tr-"],
    td: ["cell-", "td-"],
    form: ["form-", "input-group"],
    input: ["input-", "form-control"],
    select: ["select-", "form-select"],
    textarea: ["textarea-", "form-control"],
    h1: ["title-", "heading-", "display-"],
    h2: ["title-", "heading-", "display-"],
    h3: ["title-", "heading-", "display-"],
    h4: ["title-", "heading-", "display-"],
    h5: ["title-", "heading-", "display-"],
    h6: ["title-", "heading-", "display-"],
    p: ["text-", "paragraph-"],
    span: ["text-", "badge-", "label-"],
    div: ["container-", "row-", "col-", "card-"],
    section: ["section-", "container-"],
    header: ["header-", "navbar-"],
    footer: ["footer-", "bottom-"],
    nav: ["nav-", "navbar-", "menu-"],
    aside: ["sidebar-", "aside-"],
    main: ["main-", "content-"],
    article: ["article-", "post-"],
  };

  // Elementos específicos tienen precedencia
  if (elementType in elementClassMap) {
    const relevantPrefixes = elementClassMap[elementType];
    return relevantPrefixes.some((prefix) => className.startsWith(prefix));
  }

  // Para elementos sin mapeo específico
  return false;
}

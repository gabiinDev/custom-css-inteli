import * as vscode from "vscode";
import { CssClassProvider } from "./providers/cssClassProvider";
import { IconProvider } from "./providers/iconProvider";
import { CssColorProvider } from "./providers/cssColorProvider";
import { CssParser } from "./parsers/cssParser";
import { IconParser } from "./parsers/iconParser";
import * as path from "path";
import * as fs from "fs";

// Ruta al archivo CSS minificado
const CSS_FILE_PATH = path.join(__dirname, "..", "assets", "css", "nf.min.css");

// Definir los lenguajes soportados
const SUPPORTED_LANGUAGES = [
  "html",
  "css",
  "javascript",
  "typescript",
  "javascriptreact",
  "typescriptreact",
  "vue",
];

// Esta función se ejecuta cuando se activa la extensión
export function activate(context: vscode.ExtensionContext) {
  console.log("NF Style Intellisense está activado");

  // Copiar el archivo CSS a assets si no existe
  const assetsCssPath = path.join(context.extensionPath, "assets", "css");
  const targetCssPath = path.join(assetsCssPath, "nf.min.css");

  if (!fs.existsSync(assetsCssPath)) {
    fs.mkdirSync(assetsCssPath, { recursive: true });
  }

  // Copiar el archivo original si no existe en assets
  if (!fs.existsSync(targetCssPath)) {
    const originalCssPath = path.join(context.extensionPath, "nf.min.css");
    if (fs.existsSync(originalCssPath)) {
      fs.copyFileSync(originalCssPath, targetCssPath);
    }
  }

  // Parsear el CSS
  const cssParser = new CssParser(targetCssPath);
  const cssClasses = cssParser.parseClasses();
  const cssColors = cssParser.parseColors();

  // Parsear los iconos
  const iconParser = new IconParser(targetCssPath);
  const icons = iconParser.parseIcons();

  // Registrar proveedores
  // Nota: Proveedores mejorados con detección de contexto HTML
  // para mostrar sugerencias relevantes según el tipo de elemento
  const cssClassProvider = new CssClassProvider(cssClasses);
  const iconProvider = new IconProvider(icons);
  const cssColorProvider = new CssColorProvider(cssColors);

  // Registrar proveedores de autocompletado
  const cssClassCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      SUPPORTED_LANGUAGES,
      cssClassProvider,
      " ",
      "."
    );

  const iconCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      SUPPORTED_LANGUAGES,
      iconProvider,
      " ",
      "."
    );

  const cssColorCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      SUPPORTED_LANGUAGES,
      cssColorProvider,
      " ",
      ":"
    );

  // Proveedores de hover
  const cssClassHoverProvider = vscode.languages.registerHoverProvider(
    SUPPORTED_LANGUAGES,
    cssClassProvider
  );

  const iconHoverProvider = vscode.languages.registerHoverProvider(
    SUPPORTED_LANGUAGES,
    iconProvider
  );

  // Registrar comando para mostrar todas las clases
  const showCssClassesCommand = vscode.commands.registerCommand(
    "nf-intellisense.showCssClasses",
    () => {
      const items = cssClasses.map((cssClass) => ({
        label: cssClass.name,
        description: cssClass.description,
        detail: `Propiedades: ${cssClass.properties.length}`,
      }));

      vscode.window
        .showQuickPick(items, {
          placeHolder: "Selecciona una clase CSS",
        })
        .then((selectedItem) => {
          if (selectedItem) {
            const selectedClass = cssClasses.find(
              (c) => c.name === selectedItem.label
            );
            if (selectedClass) {
              const properties = selectedClass.properties
                .map((p) => `${p.name}: ${p.value};`)
                .join("\n");
              vscode.window.showInformationMessage(
                `Clase: ${selectedClass.name}\n${properties}`
              );
            }
          }
        });
    }
  );

  // Registrar comando para mostrar todos los iconos
  const showIconsCommand = vscode.commands.registerCommand(
    "nf-intellisense.showIcons",
    () => {
      const items = icons.map((icon) => ({
        label: icon.name,
        description: icon.unicode,
        detail: `fa ${icon.name}`,
      }));

      vscode.window
        .showQuickPick(items, {
          placeHolder: "Selecciona un icono",
        })
        .then((selectedItem) => {
          if (selectedItem) {
            const selectedIcon = icons.find(
              (i) => i.name === selectedItem.label
            );
            if (selectedIcon) {
              vscode.window.showInformationMessage(
                `Icono: ${selectedIcon.name}\nUnicode: ${selectedIcon.unicode}\nHTML: <i class="fa ${selectedIcon.name}"></i>`
              );
            }
          }
        });
    }
  );

  // Registrar las disposiciones
  context.subscriptions.push(
    cssClassCompletionProvider,
    iconCompletionProvider,
    cssColorCompletionProvider,
    cssClassHoverProvider,
    iconHoverProvider,
    showCssClassesCommand,
    showIconsCommand
  );
}

// Esta función se ejecuta cuando se desactiva la extensión
export function deactivate() {
  console.log("NF Style Intellisense está desactivado");
}

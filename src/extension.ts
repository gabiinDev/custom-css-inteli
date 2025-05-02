import * as vscode from "vscode";
import { CssClassProvider } from "./providers/cssClassProvider";
import { IconProvider } from "./providers/iconProvider";
import { CssColorProvider } from "./providers/cssColorProvider";
import { CssParser } from "./parsers/cssParser";
import { IconParser } from "./parsers/iconParser";
import * as path from "path";
import * as fs from "fs";
import { themes } from "./config/themes";
import { ConfigManager } from "./config/configManager";
import { CssService } from "./services/cssService";
import { Logger, LogLevel } from "./utils/logger";

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
export async function activate(context: vscode.ExtensionContext) {
  // Inicializar el sistema de logging
  Logger.initialize(context, LogLevel.INFO);
  Logger.info("NF2 Style Intellisense está activándose");

  // Mostrar información sobre temas disponibles
  Logger.info(`Temas disponibles:`);
  Object.entries(themes).forEach(([id, theme]) => {
    Logger.info(`  - ${theme.name} (${id}): ${theme.url}`);
  });

  // Inicializar servicio CSS
  const cssService = new CssService(context);

  // Obtener el archivo CSS del tema actual
  try {
    const themeId = ConfigManager.getCurrentThemeId();
    const theme = ConfigManager.getCurrentTheme();
    Logger.info(`Tema actual: ${theme.name} (${themeId})`);
    Logger.info(`URL de CDN: ${theme.url}`);

    const cssFilePath = await cssService.getCurrentCssFilePath();
    Logger.info(`Archivo CSS cargado desde: ${cssFilePath}`);

    // Parsear el CSS
    Logger.info("Iniciando parseo de archivo CSS...");
    const cssParser = new CssParser(cssFilePath);
    const cssClasses = cssParser.parseClasses();
    const cssColors = cssParser.parseColors();
    Logger.success(
      `Parseo completado. Clases CSS encontradas: ${cssClasses.length}, Colores encontrados: ${cssColors.size}`
    );

    // Parsear los iconos
    Logger.info("Iniciando parseo de iconos...");
    const iconParser = new IconParser(cssFilePath);
    const icons = iconParser.parseIcons();
    Logger.success(
      `Parseo de iconos completado. Iconos encontrados: ${icons.length}`
    );

    // Registrar proveedores
    Logger.info("Registrando proveedores de autocompletado y hover...");
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

    // Registrar las disposiciones de proveedores
    context.subscriptions.push(
      cssClassCompletionProvider,
      iconCompletionProvider,
      cssColorCompletionProvider,
      cssClassHoverProvider,
      iconHoverProvider
    );
    Logger.success("Proveedores registrados correctamente");

    // Comando para mostrar logs
    const showLogsCommand = vscode.commands.registerCommand(
      "nf2-intellisense.showLogs",
      () => {
        Logger.info("Mostrando panel de logs");
        Logger.show();
      }
    );

    // Comando para seleccionar tema
    const selectThemeCommand = vscode.commands.registerCommand(
      "nf2-intellisense.selectTheme",
      async () => {
        Logger.info("Iniciando selección de tema...");
        // Preparar opciones de selección
        const themeItems = Object.entries(themes).map(([id, theme]) => ({
          label: theme.name,
          description: id,
          detail: theme.description,
        }));

        // Mostrar selector
        const selectedItem = await vscode.window.showQuickPick(themeItems, {
          placeHolder: "Selecciona un tema de NF2",
        });

        if (selectedItem) {
          const themeId = selectedItem.description;
          Logger.info(`Tema seleccionado: ${selectedItem.label} (${themeId})`);

          // Preguntar si guardar global o en workspace
          const saveOption = await vscode.window.showQuickPick(
            [
              { label: "Workspace", description: "Solo para este proyecto" },
              { label: "Global", description: "Para todos los proyectos" },
            ],
            { placeHolder: "¿Dónde quieres guardar esta configuración?" }
          );

          if (saveOption) {
            const isGlobal = saveOption.label === "Global";
            Logger.info(
              `Guardando configuración en: ${isGlobal ? "Global" : "Workspace"}`
            );

            try {
              // Guardar configuración
              await ConfigManager.setCurrentTheme(themeId, isGlobal);

              // Actualizar caché
              Logger.info(`Actualizando caché para el tema: ${themeId}`);
              const selectedTheme = ConfigManager.getThemeById(themeId);
              Logger.info(`URL del tema seleccionado: ${selectedTheme.url}`);
              await cssService.updateThemeCache(themeId);

              vscode.window.showInformationMessage(
                `Tema cambiado a ${selectedItem.label}. Reinicia VS Code para aplicar los cambios.`
              );
              Logger.success(
                `Tema cambiado exitosamente a: ${selectedItem.label}`
              );
            } catch (error) {
              Logger.error(`Error al cambiar el tema:`, error);
              vscode.window.showErrorMessage(
                `Error al cambiar el tema: ${
                  error instanceof Error ? error.message : String(error)
                }`
              );
            }
          }
        } else {
          Logger.info("Selección de tema cancelada por el usuario");
        }
      }
    );

    // Comando para limpiar caché
    const clearCacheCommand = vscode.commands.registerCommand(
      "nf2-intellisense.clearCache",
      () => {
        try {
          Logger.info("Iniciando limpieza de caché...");
          cssService.clearCache();
          vscode.window.showInformationMessage(
            "Caché limpiada correctamente. Reinicia VS Code para aplicar los cambios."
          );
          Logger.success("Caché limpiada exitosamente");
        } catch (error) {
          Logger.error("Error al limpiar la caché:", error);
          vscode.window.showErrorMessage(
            `Error al limpiar la caché: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    );

    // Comando para abrir la documentación en línea
    const openDocumentationCommand = vscode.commands.registerCommand(
      "nf2-intellisense.openDocumentation",
      () => {
        Logger.info("Abriendo documentación en línea...");
        vscode.env.openExternal(
          vscode.Uri.parse("https://ux.gruposancorseguros.com/#/nf2")
        );
        Logger.success("Documentación abierta en el navegador");
      }
    );

    // Registrar los comandos
    context.subscriptions.push(
      showLogsCommand,
      selectThemeCommand,
      clearCacheCommand,
      openDocumentationCommand
    );

    Logger.success("NF2 Style Intellisense activado con éxito");
  } catch (error) {
    Logger.error("Error al inicializar NF2 Style Intellisense:", error);
    vscode.window.showErrorMessage(
      `Error al inicializar NF2 Style Intellisense: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Esta función se ejecuta cuando se desactiva la extensión
export function deactivate() {
  Logger.info("NF2 Style Intellisense está desactivado");
}

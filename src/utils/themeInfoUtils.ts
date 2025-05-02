import * as vscode from "vscode";
import { ConfigManager } from "../config/configManager";
import { Logger } from "./logger";

/**
 * Información sobre el tema actual
 */
export interface ThemeInfo {
  id: string;
  name: string;
  scope: "global" | "workspace" | "default";
}

/**
 * Obtiene información sobre el tema actual, incluyendo si está definido a nivel global o workspace
 * @returns Información del tema actual
 */
export function getCurrentThemeInfo(): ThemeInfo {
  const THEME_KEY = "nf2-intellisense.theme";
  const themeId = ConfigManager.getCurrentThemeId();
  const theme = ConfigManager.getThemeById(themeId);

  let scope: "global" | "workspace" | "default" = "default";

  // Verificar si está definido en el workspace
  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    const workspaceConfig = vscode.workspace.getConfiguration(
      undefined,
      vscode.workspace.workspaceFolders[0].uri
    );

    const workspaceTheme = workspaceConfig.inspect(THEME_KEY)?.workspaceValue;

    if (workspaceTheme === themeId) {
      scope = "workspace";
    }
  }

  // Si no está en workspace, verificar si está definido a nivel global
  if (scope === "default") {
    const globalTheme = vscode.workspace
      .getConfiguration()
      .inspect(THEME_KEY)?.globalValue;

    if (globalTheme === themeId) {
      scope = "global";
    }
  }

  Logger.debug(`Tema actual: ${theme.name} (${themeId}), Scope: ${scope}`);

  return {
    id: themeId,
    name: theme.name,
    scope,
  };
}

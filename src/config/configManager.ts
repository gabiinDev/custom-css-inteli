import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { themes, DEFAULT_THEME, Theme } from "./themes";
import { Logger } from "../utils/logger";

/**
 * Clase para gestionar la configuración del tema
 */
export class ConfigManager {
  private static readonly EXTENSION_CONFIG_SECTION = "nf2-intellisense";
  private static readonly THEME_SETTING_KEY = "theme";

  /**
   * Obtiene el ID del tema actual
   * @returns ID del tema actual
   */
  public static getCurrentThemeId(): string {
    // Primero, buscar en la configuración del workspace
    const workspaceConfig = this.getWorkspaceConfig();
    const workspaceTheme = workspaceConfig?.get<string>(this.THEME_SETTING_KEY);

    if (workspaceTheme && themes[workspaceTheme]) {
      Logger.debug(
        `Tema encontrado en configuración del workspace: ${workspaceTheme}`
      );
      return workspaceTheme;
    }

    // Si no hay configuración de workspace, usar la configuración global
    const globalConfig = vscode.workspace.getConfiguration(
      this.EXTENSION_CONFIG_SECTION
    );
    const globalTheme = globalConfig.get<string>(this.THEME_SETTING_KEY);

    if (globalTheme && themes[globalTheme]) {
      Logger.debug(`Tema encontrado en configuración global: ${globalTheme}`);
      return globalTheme;
    }

    // Si no hay configuración, usar el tema por defecto
    Logger.debug(
      `No se encontró configuración de tema. Usando tema por defecto: ${DEFAULT_THEME}`
    );
    return DEFAULT_THEME;
  }

  /**
   * Obtiene el tema actual
   * @returns Objeto Theme actual
   */
  public static getCurrentTheme(): Theme {
    const themeId = this.getCurrentThemeId();
    return themes[themeId];
  }

  /**
   * Obtiene un tema específico por su ID
   * @param themeId ID del tema
   * @returns Objeto Theme correspondiente al ID o el tema por defecto si no existe
   */
  public static getThemeById(themeId: string): Theme {
    if (themes[themeId]) {
      return themes[themeId];
    } else {
      Logger.warning(
        `Tema con ID "${themeId}" no encontrado. Usando tema por defecto.`
      );
      return themes[DEFAULT_THEME];
    }
  }

  /**
   * Establece el tema actual
   * @param themeId ID del tema
   * @param global Si es true, guarda en la configuración global, si es false en la del workspace
   */
  public static async setCurrentTheme(
    themeId: string,
    global: boolean = false
  ): Promise<void> {
    if (!themes[themeId]) {
      const errorMsg = `Tema no válido: ${themeId}`;
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    Logger.info(
      `Configurando tema: ${themeId}, Tipo: ${global ? "Global" : "Workspace"}`
    );

    try {
      if (global) {
        // Guardar en configuración global
        const config = vscode.workspace.getConfiguration(
          this.EXTENSION_CONFIG_SECTION
        );
        await config.update(
          this.THEME_SETTING_KEY,
          themeId,
          vscode.ConfigurationTarget.Global
        );
        Logger.info(`Tema ${themeId} guardado en configuración global`);
      } else {
        // Guardar en configuración del workspace
        await this.saveToWorkspaceSettings(themeId);
        Logger.info(`Tema ${themeId} guardado en configuración del workspace`);
      }
    } catch (error) {
      Logger.error("Error al guardar la configuración del tema:", error);
      throw error;
    }
  }

  /**
   * Guarda la configuración del tema en el archivo .vscode/settings.json del workspace
   * @param themeId ID del tema
   */
  private static async saveToWorkspaceSettings(themeId: string): Promise<void> {
    // Verificar si hay un workspace abierto
    if (
      !vscode.workspace.workspaceFolders ||
      vscode.workspace.workspaceFolders.length === 0
    ) {
      const errorMsg = "No hay un workspace abierto";
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const settingsDir = path.join(workspaceFolder.uri.fsPath, ".vscode");
    const settingsPath = path.join(settingsDir, "settings.json");

    Logger.debug(`Guardando tema ${themeId} en: ${settingsPath}`);

    try {
      // Crear directorio .vscode si no existe
      if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
        Logger.debug(`Directorio .vscode creado: ${settingsDir}`);
      }

      // Leer o crear settings.json
      let settings: any = {};
      if (fs.existsSync(settingsPath)) {
        const content = fs.readFileSync(settingsPath, "utf-8");
        settings = JSON.parse(content || "{}");
        Logger.debug(`Archivo settings.json existente cargado`);
      } else {
        Logger.debug(`Creando nuevo archivo settings.json`);
      }

      // Actualizar la configuración del tema
      const settingKey = `${this.EXTENSION_CONFIG_SECTION}.${this.THEME_SETTING_KEY}`;
      settings[settingKey] = themeId;

      // Escribir el archivo
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      Logger.debug(
        `Configuración guardada en settings.json: ${settingKey}=${themeId}`
      );
    } catch (error) {
      Logger.error("Error al guardar en settings.json:", error);
      throw error;
    }
  }

  /**
   * Obtiene la configuración del workspace
   * @returns Configuración del workspace o undefined si no existe
   */
  private static getWorkspaceConfig():
    | vscode.WorkspaceConfiguration
    | undefined {
    if (
      !vscode.workspace.workspaceFolders ||
      vscode.workspace.workspaceFolders.length === 0
    ) {
      Logger.debug("No hay un workspace abierto para obtener configuración");
      return undefined;
    }

    return vscode.workspace.getConfiguration(
      this.EXTENSION_CONFIG_SECTION,
      vscode.workspace.workspaceFolders[0].uri
    );
  }
}

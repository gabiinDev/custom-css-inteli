import * as vscode from "vscode";
import * as path from "path";
import { ConfigManager } from "../config/configManager";
import { CacheManager } from "../utils/cacheManager";
import { Theme } from "../config/themes";
import { Logger } from "../utils/logger";

/**
 * Servicio para gestionar la obtención de archivos CSS
 */
export class CssService {
  private cacheManager: CacheManager;

  /**
   * Constructor
   * @param context Contexto de la extensión
   */
  constructor(private context: vscode.ExtensionContext) {
    this.cacheManager = new CacheManager(context);
    Logger.success("Servicio CSS inicializado");
  }

  /**
   * Obtiene la ruta al archivo CSS del tema actual
   * @returns Promesa con la ruta al archivo CSS
   */
  public async getCurrentCssFilePath(): Promise<string> {
    // Obtener el tema actual
    const themeId = ConfigManager.getCurrentThemeId();
    const theme = ConfigManager.getThemeById(themeId);
    Logger.info(
      `Obteniendo archivo CSS para el tema: ${theme.name} (${themeId})`
    );
    Logger.debug(`URL del tema: ${theme.url}`);

    try {
      // Comprobar si el archivo está en caché y es válido
      if (this.cacheManager.isCached(themeId, theme.url)) {
        const cachedPath = this.cacheManager.getCachedFilePath(themeId);
        if (cachedPath) {
          Logger.success(`Usando archivo CSS desde caché: ${cachedPath}`);
          return cachedPath;
        }
      }

      // Si no está en caché o ha expirado, descargar de nuevo
      Logger.info(
        `Archivo no encontrado en caché o expirado. Descargando desde CDN: ${theme.url}`
      );
      const filePath = await this.cacheManager.downloadAndCache(
        themeId,
        theme.url
      );
      Logger.success(`Archivo CSS descargado y guardado en: ${filePath}`);
      return filePath;
    } catch (error) {
      Logger.error(
        `Error al obtener el archivo CSS para el tema ${themeId}:`,
        error
      );

      // En caso de error, intentar usar el archivo local
      const fallbackPath = path.join(this.context.extensionPath, "nf.min.css");
      Logger.warning(`Usando archivo CSS local como fallback: ${fallbackPath}`);
      return fallbackPath;
    }
  }

  /**
   * Descarga y actualiza la caché para un tema específico
   * @param themeId ID del tema
   * @returns Promesa con la ruta al archivo CSS
   */
  public async updateThemeCache(themeId: string): Promise<string> {
    // Obtener el tema específico por su ID en lugar del tema actual
    const theme = ConfigManager.getThemeById(themeId);
    Logger.info(
      `Actualizando caché para el tema ${theme.name} (${themeId}). URL: ${theme.url}`
    );

    try {
      const filePath = await this.cacheManager.downloadAndCache(
        themeId,
        theme.url
      );
      Logger.success(
        `Caché actualizada correctamente. Archivo guardado en: ${filePath}`
      );
      return filePath;
    } catch (error) {
      Logger.error(
        `Error al actualizar la caché para el tema ${themeId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Limpia la caché de todos los temas
   */
  public clearCache(): void {
    Logger.info("Limpiando caché de todos los temas...");
    try {
      this.cacheManager.clearCache();
      Logger.success("Caché limpiada correctamente");
    } catch (error) {
      Logger.error("Error al limpiar la caché:", error);
      throw error;
    }
  }
}

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as vscode from "vscode";
import { Logger } from "./logger";

/**
 * Interfaz para la información de caché
 */
interface CacheInfo {
  url: string;
  timestamp: number;
  filePath: string;
}

/**
 * Interfaz para el objeto que almacena la información de caché
 */
interface CacheRegistry {
  [themeId: string]: CacheInfo;
}

/**
 * Tiempo de caducidad de la caché en milisegundos (30 días)
 */
const CACHE_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

/**
 * Clase para gestionar la caché de archivos CSS
 */
export class CacheManager {
  private cacheDir: string;
  private cacheRegistryPath: string;
  private cacheRegistry: CacheRegistry;

  /**
   * Constructor
   * @param context Contexto de la extensión
   */
  constructor(private context: vscode.ExtensionContext) {
    this.cacheDir = path.join(context.globalStorageUri.fsPath, "cache");
    this.cacheRegistryPath = path.join(this.cacheDir, "registry.json");
    this.cacheRegistry = {};

    // Crear directorio de caché si no existe
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      Logger.info(`Directorio de caché creado: ${this.cacheDir}`);
    } else {
      Logger.info(`Usando directorio de caché existente: ${this.cacheDir}`);
    }

    // Cargar registro de caché si existe
    this.loadCacheRegistry();
    Logger.info("Administrador de caché inicializado");
  }

  /**
   * Carga el registro de caché del archivo JSON
   */
  private loadCacheRegistry(): void {
    try {
      if (fs.existsSync(this.cacheRegistryPath)) {
        const data = fs.readFileSync(this.cacheRegistryPath, "utf-8");
        this.cacheRegistry = JSON.parse(data);
        Logger.info(
          `Registro de caché cargado. Temas en caché: ${
            Object.keys(this.cacheRegistry).length
          }`
        );

        // Log de los temas en caché
        Object.entries(this.cacheRegistry).forEach(([themeId, info]) => {
          const date = new Date(info.timestamp).toLocaleString();
          Logger.debug(
            `  - Tema: ${themeId}, URL: ${info.url}, Fecha: ${date}`
          );
        });
      } else {
        Logger.info("No se encontró registro de caché. Se usará uno nuevo.");
        this.cacheRegistry = {};
      }
    } catch (error) {
      Logger.error("Error al cargar el registro de caché:", error);
      this.cacheRegistry = {};
    }
  }

  /**
   * Guarda el registro de caché en el archivo JSON
   */
  private saveCacheRegistry(): void {
    try {
      fs.writeFileSync(
        this.cacheRegistryPath,
        JSON.stringify(this.cacheRegistry, null, 2)
      );
      Logger.debug(`Registro de caché guardado en: ${this.cacheRegistryPath}`);
    } catch (error) {
      Logger.error("Error al guardar el registro de caché:", error);
    }
  }

  /**
   * Verifica si un tema está en la caché y no ha expirado
   * @param themeId ID del tema
   * @param url URL del tema
   * @returns true si el tema está en caché y es válido
   */
  public isCached(themeId: string, url: string): boolean {
    const cacheInfo = this.cacheRegistry[themeId];
    if (!cacheInfo) {
      Logger.debug(`El tema ${themeId} no está en caché`);
      return false;
    }

    // Verificar si la URL ha cambiado
    if (cacheInfo.url !== url) {
      Logger.debug(`La URL del tema ${themeId} ha cambiado. Caché inválida.`);
      return false;
    }

    // Verificar si el archivo existe
    if (!fs.existsSync(cacheInfo.filePath)) {
      Logger.debug(
        `Archivo de caché para el tema ${themeId} no encontrado: ${cacheInfo.filePath}`
      );
      return false;
    }

    // Verificar si la caché ha expirado
    const now = Date.now();
    const age = now - cacheInfo.timestamp;
    const days = Math.floor(age / (24 * 60 * 60 * 1000));

    if (age > CACHE_EXPIRATION) {
      Logger.debug(
        `Caché del tema ${themeId} ha expirado (${days} días). Se descargará de nuevo.`
      );
      return false;
    }

    Logger.debug(`Caché válida para el tema ${themeId}. Edad: ${days} días.`);
    return true;
  }

  /**
   * Obtiene la ruta al archivo CSS en la caché
   * @param themeId ID del tema
   * @returns Ruta al archivo o undefined si no está en caché
   */
  public getCachedFilePath(themeId: string): string | undefined {
    const cacheInfo = this.cacheRegistry[themeId];
    return cacheInfo?.filePath;
  }

  /**
   * Descarga un archivo CSS desde una URL y lo guarda en la caché
   * @param themeId ID del tema
   * @param url URL del tema
   * @returns Promesa con la ruta al archivo descargado
   */
  public async downloadAndCache(themeId: string, url: string): Promise<string> {
    const filePath = path.join(this.cacheDir, `${themeId}.min.css`);
    Logger.info(`Descargando CSS para el tema ${themeId} desde: ${url}`);

    try {
      // Descargar el archivo
      await this.downloadFile(url, filePath);

      // Actualizar registro de caché
      this.cacheRegistry[themeId] = {
        url,
        timestamp: Date.now(),
        filePath,
      };

      this.saveCacheRegistry();
      Logger.info(
        `CSS para el tema ${themeId} descargado y guardado en: ${filePath}`
      );
      return filePath;
    } catch (error) {
      Logger.error(`Error al descargar el CSS para ${themeId}:`, error);
      throw error;
    }
  }

  /**
   * Descarga un archivo desde una URL
   * @param url URL del archivo
   * @param destPath Ruta de destino
   * @returns Promesa que se resuelve cuando el archivo se ha descargado
   */
  private downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);
      Logger.debug(`Iniciando descarga de: ${url}`);

      https
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            const errorMsg = `Error HTTP: ${response.statusCode}`;
            Logger.error(errorMsg);
            reject(new Error(errorMsg));
            return;
          }

          Logger.debug(
            `Respuesta recibida. Status: ${response.statusCode}. Descargando...`
          );
          response.pipe(file);

          file.on("finish", () => {
            file.close();
            const stats = fs.statSync(destPath);
            const fileSizeKB = Math.round(stats.size / 1024);
            Logger.debug(
              `Descarga completada. Tamaño del archivo: ${fileSizeKB} KB`
            );
            resolve();
          });

          file.on("error", (err) => {
            Logger.error(`Error al escribir el archivo: ${destPath}`, err);
            fs.unlinkSync(destPath);
            reject(err);
          });
        })
        .on("error", (err) => {
          Logger.error(`Error de red al descargar: ${url}`, err);
          if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
          }
          reject(err);
        });
    });
  }

  /**
   * Limpia todos los archivos de caché
   */
  public clearCache(): void {
    try {
      // Eliminar todos los archivos de caché
      const temas = Object.keys(this.cacheRegistry);
      Logger.info(
        `Limpiando caché para ${temas.length} temas: ${temas.join(", ")}`
      );

      for (const themeId in this.cacheRegistry) {
        const cacheInfo = this.cacheRegistry[themeId];
        if (fs.existsSync(cacheInfo.filePath)) {
          fs.unlinkSync(cacheInfo.filePath);
          Logger.debug(`Eliminado archivo de caché: ${cacheInfo.filePath}`);
        } else {
          Logger.warning(
            `Archivo de caché no encontrado: ${cacheInfo.filePath}`
          );
        }
      }

      // Limpiar registro de caché
      this.cacheRegistry = {};
      this.saveCacheRegistry();
      Logger.info("Todos los archivos de caché han sido eliminados");
    } catch (error) {
      Logger.error("Error al limpiar la caché:", error);
      throw error;
    }
  }
}

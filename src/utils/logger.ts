import * as vscode from "vscode";

/**
 * Niveles de log disponibles
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

/**
 * Colores para diferentes tipos de mensajes
 */
enum LogColors {
  DEBUG = "#808080", // Gris
  INFO = "#1E90FF", // Azul
  SUCCESS = "#4CAF50", // Verde
  WARNING = "#FFA500", // Naranja
  ERROR = "#FF0000", // Rojo
}

/**
 * Servicio de logging centralizado para la extensión
 */
export class Logger {
  private static channel: vscode.OutputChannel;
  private static logLevel: LogLevel = LogLevel.INFO;
  private static extensionName: string = "NF2 Style Intellisense";
  private static readonly CONFIG_SECTION = "nf2-intellisense";
  private static readonly LOG_LEVEL_KEY = "logLevel";
  private static readonly USE_COLORS_KEY = "useColoredLogs";
  private static useColors: boolean = true;

  /**
   * Inicializa el sistema de logging
   * @param context Contexto de la extensión
   * @param level Nivel mínimo de log (por defecto INFO)
   */
  public static initialize(
    context: vscode.ExtensionContext,
    level: LogLevel = LogLevel.INFO
  ): void {
    this.channel = vscode.window.createOutputChannel(this.extensionName);
    this.logLevel = level;
    context.subscriptions.push(this.channel);

    // Configurar un listener para cambios en el nivel de log
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (
          e.affectsConfiguration(
            `${this.CONFIG_SECTION}.${this.LOG_LEVEL_KEY}`
          ) ||
          e.affectsConfiguration(
            `${this.CONFIG_SECTION}.${this.USE_COLORS_KEY}`
          )
        ) {
          this.updateConfigSettings();
        }
      })
    );

    // Cargar configuración
    this.updateConfigSettings();

    this.info("Sistema de logging inicializado");
  }

  /**
   * Actualiza la configuración desde settings
   */
  private static updateConfigSettings(): void {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);

    // Actualizar nivel de log
    const configLogLevel = config.get<string>(this.LOG_LEVEL_KEY, "INFO");
    try {
      const newLevel = LogLevel[configLogLevel as keyof typeof LogLevel];
      if (newLevel !== undefined) {
        this.logLevel = newLevel;
        this.info(
          `Nivel de log actualizado desde configuración: ${configLogLevel}`
        );
      } else {
        this.warning(
          `Nivel de log inválido en configuración: ${configLogLevel}. Usando INFO.`
        );
        this.logLevel = LogLevel.INFO;
      }
    } catch (error) {
      this.warning(
        `Error al procesar nivel de log: ${configLogLevel}. Usando INFO.`
      );
      this.logLevel = LogLevel.INFO;
    }

    // Actualizar uso de colores
    this.useColors = config.get<boolean>(this.USE_COLORS_KEY, true);
    this.debug(
      `Uso de colores en log: ${this.useColors ? "activado" : "desactivado"}`
    );
  }

  /**
   * Establece el nivel de log
   * @param level Nivel de log
   */
  public static setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info(`Nivel de log establecido a: ${LogLevel[level]}`);
  }

  /**
   * Registra un mensaje de nivel DEBUG
   * @param message Mensaje a registrar
   */
  public static debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  /**
   * Registra un mensaje de nivel INFO
   * @param message Mensaje a registrar
   */
  public static info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Registra un mensaje de éxito (nivel INFO con formato especial)
   * @param message Mensaje a registrar
   */
  public static success(message: string): void {
    this.log(LogLevel.INFO, message, "SUCCESS");
  }

  /**
   * Registra un mensaje de nivel WARNING
   * @param message Mensaje a registrar
   */
  public static warning(message: string): void {
    this.log(LogLevel.WARNING, message);
  }

  /**
   * Registra un mensaje de nivel ERROR
   * @param message Mensaje a registrar
   * @param error Error opcional
   */
  public static error(message: string, error?: unknown): void {
    let fullMessage = message;

    if (error) {
      if (error instanceof Error) {
        fullMessage += `\nDetalles: ${error.message}`;
        if (error.stack) {
          fullMessage += `\nStack: ${error.stack}`;
        }
      } else {
        fullMessage += `\nDetalles: ${String(error)}`;
      }
    }

    this.log(LogLevel.ERROR, fullMessage);
  }

  /**
   * Registra un mensaje en el nivel especificado
   * @param level Nivel de log
   * @param message Mensaje a registrar
   * @param overrideType Tipo específico de mensaje para formateo
   */
  private static log(
    level: LogLevel,
    message: string,
    overrideType?: string
  ): void {
    if (level >= this.logLevel) {
      const timestamp = new Date().toISOString();
      const levelName = LogLevel[level].padEnd(7, " ");

      // Determinar el tipo de mensaje para el formateo
      let type = overrideType || LogLevel[level];

      // En VS Code Output no se puede usar ANSI, usamos formato más simple
      // con prefijos distintivos por nivel
      let prefix: string;

      if (this.useColors) {
        // Usamos un esquema visual simple pero efectivo
        switch (type) {
          case "DEBUG":
            prefix = "[·] ";
            break;
          case "INFO":
            prefix = "[i] ";
            break;
          case "SUCCESS":
            prefix = "[✓] ";
            break;
          case "WARNING":
            prefix = "[!] ";
            break;
          case "ERROR":
            prefix = "[✗] ";
            break;
          default:
            prefix = "[·] ";
        }
      } else {
        prefix = "";
      }

      // Formatear mensaje
      const formattedMessage = `[${timestamp}] [${levelName}] ${prefix}${message}`;
      this.channel.appendLine(formattedMessage);

      // También enviamos a la consola para desarrollo
      // Aquí podríamos usar colores ANSI si fuera necesario para la consola de desarrollo
      if (level >= LogLevel.WARNING) {
        if (level === LogLevel.ERROR) {
          console.error(formattedMessage);
        } else {
          console.warn(formattedMessage);
        }
      } else if (level === LogLevel.INFO) {
        console.info(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  /**
   * Muestra el panel de log
   */
  public static show(): void {
    this.channel.show();
  }
}

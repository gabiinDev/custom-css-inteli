# NF2 Style Intellisense

Extensión para VSCode que proporciona intellisense para los estilos del tema NF2.

## Características

- Autocompletado de clases CSS
- Visualización de propiedades al pasar el cursor
- Vista previa de iconos FontAwesome 
- Documentación integrada de estilos disponibles
- Priorización inteligente de clases CSS según el contexto HTML
  - Las clases relacionadas con `<i>` aparecen primero al trabajar con iconos
  - Las clases relacionadas con `<li>` aparecen primero al trabajar con listas
  - Y así con otros elementos HTML comunes
- **Nuevo:** Múltiples temas con configuración por proyecto
  - Grupo Sancor Seguros
  - Prevenet
  - Intermediarios
  - Clientes y Prestadores
  - Prevención Salud
- **Nuevo:** Sistema de caché para mejorar el rendimiento
  - Caché automática de archivos CSS por 30 días
  - Opción para limpiar la caché manualmente
- **Nuevo:** Sistema de logging detallado
  - Consulta de logs para diagnóstico de problemas
  - Niveles de log configurables (DEBUG, INFO, WARNING, ERROR)
- **Nuevo:** Información de tema en autocompletado
  - Visualización del tema actual configurado
  - Indicación si la configuración es global o por workspace
- **Nuevo:** Enlaces a documentación oficial
  - Acceso directo a https://ux.gruposancorseguros.com/#/nf2
  - Disponible en todos los tipos de autocompletado

## Instalación

1. Abre VSCode
2. Presiona `Ctrl+Shift+X` para abrir el panel de extensiones
3. Busca "NF2 Style Intellisense"
4. Haz clic en "Instalar"

## Uso

La extensión se activa automáticamente al editar archivos HTML, CSS, JavaScript, TypeScript y Vue.

### Comandos disponibles

Presiona `Ctrl+Shift+P` para abrir la paleta de comandos y escribe "NF2" para ver todos los comandos disponibles:

- `NF2: Documentación en línea` - Abre la documentación oficial de NF2 en el navegador
- `NF2: Seleccionar tema` - Permite seleccionar el tema a utilizar (por proyecto o global)
- `NF2: Limpiar caché` - Limpia la caché de todos los temas
- `NF2: Mostrar logs` - Muestra el panel de logs para diagnóstico

### Configuración de temas

Puedes configurar el tema de NF2 de varias formas:

1. **Por proyecto**: Usa el comando `NF2: Seleccionar tema` y elige la opción "Workspace". Esto guardará la configuración en el archivo `.vscode/settings.json` del proyecto.

2. **Global**: Usa el comando `NF2: Seleccionar tema` y elige la opción "Global". Esto aplicará el tema seleccionado a todos los proyectos.

3. **Manual**: Puedes editar directamente el archivo `.vscode/settings.json` y añadir la siguiente configuración:
   ```json
   {
     "nf2-intellisense.theme": "gss"
   }
   ```
   Los valores posibles son: `gss`, `prevenet`, `intermediarios`, `clipresta`, `psalud`.

### Configuración de logs

Puedes ajustar el nivel de detalle de los logs en el archivo de configuración de VS Code:

```json
{
  "nf2-intellisense.logLevel": "DEBUG" 
}
```

Los niveles disponibles son:
- `DEBUG` - Información muy detallada (útil para desarrollo y diagnóstico)
- `INFO` - Información general (por defecto)
- `WARNING` - Solo advertencias y errores
- `ERROR` - Solo errores

## Desarrollo

### Estructura del proyecto

```
nf2-intellisense/
├── .vscode/                    # Configuración de VSCode
├── src/                        # Código fuente
│   ├── extension.ts            # Punto de entrada de la extensión
│   ├── providers/              # Proveedores de intellisense
│   │   ├── cssClassProvider.ts # Proveedor para clases CSS
│   │   ├── iconProvider.ts     # Proveedor para iconos
│   │   └── cssColorProvider.ts # Proveedor para colores
│   ├── parsers/                # Analizadores
│   │   ├── cssParser.ts        # Parseador de CSS
│   │   └── iconParser.ts       # Parseador de iconos
│   ├── models/                 # Modelos de datos
│   │   ├── cssClass.ts         # Modelo de clase CSS
│   │   ├── cssProperty.ts      # Modelo de propiedad CSS
│   │   └── icon.ts             # Modelo de icono
│   ├── config/                 # Configuración
│   │   ├── themes.ts           # Definición de temas
│   │   └── configManager.ts    # Gestor de configuración
│   ├── services/               # Servicios
│   │   └── cssService.ts       # Servicio para gestión CSS
│   ├── utils/                  # Utilidades
│   │   ├── cssUtil.ts          # Utilidades para CSS
│   │   ├── fileUtil.ts         # Utilidades para manejo de archivos
│   │   ├── htmlUtils.ts        # Utilidades para análisis HTML
│   │   ├── cacheManager.ts     # Gestor de caché
│   │   └── logger.ts           # Sistema de logging
│   └── test/                   # Pruebas unitarias
├── assets/                     # Recursos estáticos
│   ├── css/                    # Archivos CSS procesados
│   ├── icons/                  # Iconos de la extensión
│   └── images/                 # Imágenes de documentación
├── dist/                       # Archivos compilados (generados)
├── node_modules/               # Dependencias (generado)
├── package.json                # Configuración de la extensión
├── tsconfig.json               # Configuración de TypeScript
├── .gitignore                  # Archivos ignorados por git
├── CHANGELOG.md                # Registro de cambios
├── LICENSE                     # Licencia del proyecto
└── README.md                   # Documentación
```

### Instrucciones para desarrollo

1. Clona el repositorio
2. Ejecuta `npm install` para instalar dependencias
3. Ejecuta `npm run watch` para iniciar la compilación en modo observador
4. Presiona F5 para iniciar una instancia de depuración de VSCode con la extensión

### Probar la extensión sin publicarla

1. Instala la herramienta vsce globalmente (requerido solo una vez):
   ```
   npm install -g @vscode/vsce
   ```

2. Crea un archivo .vsix para instalar localmente:
   ```
   vsce package
   ```

3. El comando anterior generará un archivo `nf2-intellisense-[version].vsix` que puedes instalar en VSCode usando la opción "Instalar desde VSIX..." en el menú de extensiones.

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue antes de enviar un pull request.

## Licencia

MIT 
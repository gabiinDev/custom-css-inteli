# NF2 Style Intellisense

Extensión para VSCode que proporciona intellisense para los estilos del tema NF2.

## Características

- Autocompletado de clases CSS
- Visualización de propiedades al pasar el cursor
- Vista previa de iconos FontAwesome 
- Documentación integrada de estilos disponibles
- **Nuevo:** Priorización inteligente de clases CSS según el contexto HTML
  - Las clases relacionadas con `<i>` aparecen primero al trabajar con iconos
  - Las clases relacionadas con `<li>` aparecen primero al trabajar con listas
  - Y así con otros elementos HTML comunes

## Instalación

1. Abre VSCode
2. Presiona `Ctrl+Shift+X` para abrir el panel de extensiones
3. Busca "NF2 Style Intellisense"
4. Haz clic en "Instalar"

## Uso

La extensión se activa automáticamente al editar archivos HTML, CSS, JavaScript, TypeScript y Vue.

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
│   ├── utils/                  # Utilidades
│   │   ├── cssUtil.ts          # Utilidades para CSS
│   │   ├── fileUtil.ts         # Utilidades para manejo de archivos
│   │   └── htmlUtils.ts        # Utilidades para análisis HTML
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
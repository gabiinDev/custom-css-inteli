# Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [0.2.3] - 2025-05-02

### Cambiado
- Reemplazados los comandos `NF2: Mostrar todas las clases CSS disponibles` y `NF2: Mostrar todos los iconos disponibles` por un único comando `NF2: Documentación en línea` que abre directamente la documentación oficial
- Mejorado el formato visual de los logs para mayor claridad
  - Eliminados códigos ANSI que generaban caracteres extraños en la consola
  - Añadidos iconos visuales como prefijo según el nivel de log: [i], [✓], [!], [✗]

## [0.2.2] - 2025-05-02

### Añadido
- Información del tema actual en el autocompletado y hover
  - Muestra el nombre del tema (Grupo Sancor Seguros, Prevenet, etc.)
  - Indica si la configuración es global o por workspace
- Enlace a la documentación oficial en todas las sugerencias
  - Acceso directo a https://ux.gruposancorseguros.com/#/nf2
  - Disponible en clases CSS, iconos y colores
- Soporte para logs coloreados
  - Mensajes en azul para información general (INFO)
  - Mensajes en verde para operaciones exitosas (SUCCESS)
  - Mensajes en naranja para advertencias (WARNING)
  - Mensajes en rojo para errores (ERROR)
  - Configurable mediante la opción `nf2-intellisense.useColoredLogs`

## [0.2.1] - 2025-05-02

### Añadido
- Sistema de logging detallado para diagnóstico
  - Nuevo comando `NF2: Mostrar logs` para ver el panel de logs
  - Configuración de nivel de log en settings.json
  - Cuatro niveles disponibles: DEBUG, INFO, WARNING, ERROR
- Información de logs detallada sobre:
  - Tema seleccionado y URL de CDN
  - Estado de la caché y descargas
  - Errores y problemas de conexión
  - Operaciones de configuración

## [0.2.0] - 2025-05-01

### Añadido
- Soporte para múltiples temas con CDNs distintas
  - Grupo Sancor Seguros (por defecto)
  - Prevenet
  - Intermediarios
  - Clientes y Prestadores
  - Prevención Salud
- Comando `NF2: Seleccionar tema` para elegir el tema a utilizar
- Configuración de temas por proyecto en `.vscode/settings.json`
- Sistema de caché para archivos CSS con expiración de 30 días
- Comando `NF2: Limpiar caché` para limpiar la caché manualmente

### Mejorado
- Actualización de la documentación con las nuevas funcionalidades
- Mejor gestión de errores y mensajes informativos para el usuario

## [0.1.0] - 2025-05-01

### Añadido
- Autocompletado de clases CSS
- Visualización de propiedades al pasar el cursor
- Vista previa de iconos FontAwesome
- Documentación integrada de estilos disponibles
- Priorización inteligente de clases CSS según el contexto HTML
- Comando `NF2: Mostrar todas las clases CSS disponibles`
- Comando `NF2: Mostrar todos los iconos disponibles` 
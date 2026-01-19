# Guía de Testing - Módulo Kata

Esta guía contiene los escenarios de prueba para verificar que el módulo Kata funcione correctamente.

## Pre-requisitos

Antes de comenzar las pruebas, asegúrate de:

1. Instalar dependencias: `npm install` o `pnpm install`
2. Compilar el backend Rust: `cargo build` (desde `src-tauri/`)
3. Iniciar la aplicación en modo desarrollo: `npm run tauri dev`

## Fase 1: Configuración Básica

### Test 1.1: Inicialización de la Aplicación
**Objetivo**: Verificar que la app inicie correctamente

- [ ] La ventana principal se abre sin errores
- [ ] Se ve la página de inicio con las opciones Kata y Kumite
- [ ] El botón de Kata está activo (no deshabilitado)
- [ ] La base de datos SQLite se crea en el directorio de datos de la app

**Esperado**: Sin errores en la consola de desarrollo

---

### Test 1.2: Configuración Inicial
**Objetivo**: Configurar parámetros básicos de competencia

1. Click en "Kata" desde el menú principal
2. En la sección "Configuración":
   - Seleccionar **Área 1**
   - Seleccionar **5 Jueces**
   - Seleccionar **Base 7**
   - Ingresar categoría: "Cadete Masculino"

**Verificaciones**:
- [ ] Todos los selectores funcionan correctamente
- [ ] Los valores seleccionados se reflejan en la interfaz
- [ ] El campo de categoría acepta texto

**Esperado**: Configuración guardada automáticamente en localStorage

---

## Fase 2: Gestión de Competidores

### Test 2.1: Agregar Competidor Manualmente
**Objetivo**: Agregar un competidor usando el formulario

1. Click en "+ Agregar Competidor"
2. Ingresar:
   - Nombre: "Juan Pérez"
   - Edad: 15
3. Click en "Agregar"

**Verificaciones**:
- [ ] El modal se abre correctamente
- [ ] Los campos tienen validación (nombre min 3 chars, edad 5-100)
- [ ] El competidor aparece en la lista después de agregarlo
- [ ] Se muestra un toast de confirmación
- [ ] El modal se cierra automáticamente

**Validaciones de Error**:
- [ ] Intentar agregar con nombre vacío → Error
- [ ] Intentar agregar con nombre de 1-2 caracteres → Error
- [ ] Intentar agregar con edad < 5 → Error
- [ ] Intentar agregar con edad > 100 → Error

---

### Test 2.2: Importar desde Excel
**Objetivo**: Importar múltiples competidores desde archivo Excel

**Preparación**:
1. Click en "Ver instrucciones" en el componente de importación
2. Descargar plantilla haciendo click en "Descargar Plantilla"
3. Abrir plantilla en Excel
4. En celda B1: Escribir "Cadete Masculino"
5. Desde fila 2, agregar:
   - B2: "María García", C2: 14
   - B3: "Carlos López", C3: 15
   - B4: "Ana Rodríguez", C4: 13
6. Guardar archivo

**Proceso de Importación**:
1. Click en "Importar desde Excel"
2. Seleccionar el archivo creado
3. Click "Abrir"

**Verificaciones**:
- [ ] El diálogo de archivo se abre correctamente
- [ ] Los competidores se importan sin errores
- [ ] Se muestran 3 competidores en la lista
- [ ] La categoría se actualiza a "Cadete Masculino"
- [ ] Toast de éxito se muestra

**Casos de Error**:
- [ ] Intentar importar archivo sin categoría en B1 → Error informativo
- [ ] Intentar importar Excel con formato incorrecto → Error manejado

---

### Test 2.3: Eliminar Competidor
**Objetivo**: Eliminar un competidor de la lista

1. Click en "Eliminar" en cualquier competidor
2. Confirmar en el diálogo

**Verificaciones**:
- [ ] Aparece confirmación antes de eliminar
- [ ] El competidor desaparece de la lista
- [ ] Toast de confirmación se muestra
- [ ] La numeración se mantiene consistente

---

## Fase 3: Ventana de Proyección

### Test 3.1: Abrir Ventana de Proyección
**Objetivo**: Verificar apertura de ventana secundaria

1. Click en "Abrir Proyección"

**Verificaciones**:
- [ ] Se abre una nueva ventana con fondo azul gradiente
- [ ] El botón cambia a "Proyección Abierta" y se deshabilita
- [ ] Aparece botón "Cerrar Proyección" en color rojo
- [ ] En la ventana de proyección:
  - [ ] Indicador de conexión muestra "Conectado" (verde)
  - [ ] Se ve el área y categoría en el header
  - [ ] Aparece hint "F11 para pantalla completa" en la esquina superior izquierda

**Casos de Error**:
- [ ] Intentar abrir proyección cuando ya está abierta → Toast informativo

---

### Test 3.2: Keyboard Shortcuts en Proyección
**Objetivo**: Verificar atajos de teclado

1. En la ventana de proyección, presionar **F11**
2. Presionar **ESC**

**Verificaciones**:
- [ ] F11 activa modo pantalla completa
- [ ] El hint cambia a "ESC para salir de pantalla completa"
- [ ] ESC sale de pantalla completa
- [ ] El hint vuelve a mostrar "F11 para pantalla completa"

---

### Test 3.3: Cerrar Ventana de Proyección
**Objetivo**: Cerrar la ventana secundaria

1. Click en "Cerrar Proyección" (desde ventana principal)

**Verificaciones**:
- [ ] La ventana de proyección se cierra
- [ ] El botón vuelve a "Abrir Proyección"
- [ ] Toast de confirmación se muestra

---

## Fase 4: Evaluación de Competidores

### Test 4.1: Evaluar con 5 Jueces
**Objetivo**: Evaluar un competidor usando 5 jueces

**Pre-requisito**: Tener al menos 1 competidor en la lista, 5 jueces configurados, base 7

1. Click en "Evaluar" en el primer competidor
2. Ingresar puntajes:
   - Juez 1: 7.5
   - Juez 2: 7.8
   - Juez 3: 7.6
   - Juez 4: 7.2
   - Juez 5: 7.7
3. Observar el cálculo automático
4. Click en "Guardar Puntaje"

**Verificaciones**:
- [ ] Modal se abre con información del competidor
- [ ] Se muestran 5 campos de entrada
- [ ] Rango de puntajes mostrado: 6.0 - 10.0 (base 7, ±1 a +3)
- [ ] Cálculo automático:
  - [ ] Descarta 7.2 (menor) y 7.8 (mayor)
  - [ ] Promedia 7.5, 7.6, 7.7 → **7.60**
  - [ ] Muestra puntajes descartados en tarjeta verde
- [ ] Botón "Guardar" habilitado solo cuando todos los campos tienen valores
- [ ] Toast de éxito al guardar
- [ ] Modal se cierra
- [ ] Puntaje 7.60 aparece en la lista del competidor

**Validación de Entrada**:
- [ ] Solo acepta números decimales
- [ ] No acepta letras u otros caracteres

---

### Test 4.2: Evaluar con 3 Jueces
**Objetivo**: Evaluar con configuración de 3 jueces

**Pre-requisito**: Cambiar configuración a 3 jueces

1. Cambiar "Número de Jueces" a **3 Jueces**
2. Click en "Evaluar" en un competidor sin evaluar
3. Ingresar puntajes:
   - Juez 1: 8.0
   - Juez 2: 7.8
   - Juez 3: 7.9
4. Click en "Guardar Puntaje"

**Verificaciones**:
- [ ] Se muestran solo 3 campos
- [ ] Cálculo: promedio simple (8.0 + 7.8 + 7.9) / 3 = **7.90**
- [ ] No muestra puntajes descartados
- [ ] Puntaje se guarda correctamente

---

### Test 4.3: Re-evaluar Competidor
**Objetivo**: Cambiar puntaje de competidor ya evaluado

1. Click en "Re-evaluar" en un competidor que ya tiene puntaje
2. Los campos están vacíos (no se pre-rellenan)
3. Ingresar nuevos puntajes
4. Guardar

**Verificaciones**:
- [ ] Modal se abre correctamente
- [ ] Campos inician vacíos
- [ ] Nuevos puntajes reemplazan los anteriores
- [ ] Puntaje se actualiza en la lista

---

### Test 4.4: Descalificar (Kiken)
**Objetivo**: Marcar competidor como descalificado

1. Click en "Kiken" en cualquier competidor
2. Confirmar en el diálogo

**Verificaciones**:
- [ ] Aparece confirmación con nombre del competidor
- [ ] El competidor se marca con fondo rojo
- [ ] Aparece etiqueta "⚠️ Descalificado (Kiken)"
- [ ] Puntaje se limpia (si tenía uno)
- [ ] Botón "Evaluar" desaparece
- [ ] Botón "Kiken" desaparece
- [ ] Solo queda botón "Eliminar"

---

## Fase 5: Sincronización con Proyección

### Test 5.1: Sincronización en Tiempo Real
**Objetivo**: Verificar que la ventana de proyección se actualice automáticamente

1. Abrir ventana de proyección
2. Desde ventana principal, evaluar un competidor
3. Observar ventana de proyección

**Verificaciones**:
- [ ] Datos se actualizan en < 500ms (debounce de 300ms)
- [ ] Se muestra nombre del competidor actual (sin evaluar)
- [ ] Se muestran puntajes de jueces
- [ ] Se muestra puntaje final con animación
- [ ] Tabla de resultados se actualiza con ranking automático

---

### Test 5.2: Sincronización de Múltiples Cambios
**Objetivo**: Verificar que el debounce funcione correctamente

1. Cambiar área rápidamente: 1 → 2 → 3
2. Cambiar categoría
3. Observar ventana de proyección

**Verificaciones**:
- [ ] Solo se envía un mensaje después de 300ms del último cambio
- [ ] Todos los cambios se reflejan correctamente
- [ ] No hay spam de eventos (verificar en consola)
- [ ] Log en consola: "Kata state synced at: [timestamp]"

---

## Fase 6: Resultados Finales

### Test 6.1: Ver Resultados
**Objetivo**: Ver modal de resultados completos

**Pre-requisito**: Tener al menos 3 competidores evaluados

1. Click en "Ver Resultados"

**Verificaciones**:
- [ ] Modal se abre con tamaño 5xl
- [ ] Header muestra:
  - [ ] Título "Resultados Finales"
  - [ ] Chips con área y categoría
  - [ ] Chip con número de competidores
- [ ] Sección "Podio" (si hay ≥3 evaluados):
  - [ ] 3 tarjetas: 2° (izq), 1° (centro, más alto), 3° (der)
  - [ ] Medallas: 🥇 🥈 🥉
  - [ ] Nombres y puntajes correctos
  - [ ] Ordenamiento correcto (mayor a menor)
- [ ] Sección "Ranking Completo":
  - [ ] Lista completa de competidores evaluados
  - [ ] Numeración 1, 2, 3, ...
  - [ ] Puntajes de jueces individuales mostrados
  - [ ] Colores especiales para top 3
- [ ] Sección "No Evaluados" (si aplica):
  - [ ] Competidores sin puntaje listados
  - [ ] Fondo gris
- [ ] Sección "Descalificados" (si aplica):
  - [ ] Competidores con Kiken listados
  - [ ] Fondo rojo
  - [ ] Etiqueta "Kiken"

---

## Fase 7: Persistencia y Base de Datos

### Test 7.1: Guardar Competencia
**Objetivo**: Guardar competencia en SQLite

1. Después de evaluar varios competidores, click en "Guardar Competencia"

**Verificaciones**:
- [ ] Toast de "Guardando competencia..." aparece
- [ ] Toast de éxito con ID: "Competencia guardada con ID: X"
- [ ] No hay errores en consola
- [ ] Archivo `kata_history.db` existe en directorio de datos de la app

**Casos de Error**:
- [ ] Intentar guardar sin competidores → Error: "No hay competidores para guardar"

---

### Test 7.2: Ver Historial
**Objetivo**: Consultar competencias guardadas

1. Click en "Ver Historial"
2. Verificar que aparece la competencia guardada

**Verificaciones**:
- [ ] Modal se abre con lista de competencias
- [ ] Cada competencia muestra:
  - [ ] Nombre (auto-generado: "Kata [Área] - [Fecha]")
  - [ ] Fecha
  - [ ] Área y categoría en chips
  - [ ] Número de competidores
- [ ] Botones "Ver Detalles" y "Eliminar" presentes

---

### Test 7.3: Ver Detalles de Competencia
**Objetivo**: Ver detalles completos de competencia guardada

1. En historial, click en "Ver Detalles" en una competencia

**Verificaciones**:
- [ ] Se abre modal de detalles
- [ ] Muestra información completa:
  - [ ] Nombre, fecha, área, categoría
  - [ ] Podio (si hay ≥3 competidores)
  - [ ] Ranking completo con puntajes
  - [ ] Puntajes de jueces individuales
- [ ] Botón "Cargar en Sesión Actual" presente
- [ ] Botón "Volver" cierra y regresa a lista

---

### Test 7.4: Cargar Competencia desde Historial
**Objetivo**: Restaurar competencia guardada en sesión actual

1. Desde detalles de competencia, click en "Cargar en Sesión Actual"
2. Confirmar en diálogo

**Verificaciones**:
- [ ] Competidores se cargan en la lista
- [ ] Área se actualiza
- [ ] Categoría se actualiza
- [ ] Puntajes se mantienen
- [ ] Toast: "Competencia cargada desde el historial"
- [ ] Modales se cierran automáticamente

**Advertencia**:
- [ ] Se pierde la sesión actual (si había datos sin guardar)

---

### Test 7.5: Eliminar Competencia
**Objetivo**: Eliminar competencia del historial

1. En historial, click en "Eliminar"
2. Confirmar

**Verificaciones**:
- [ ] Aparece confirmación
- [ ] Competencia desaparece de la lista
- [ ] Toast de éxito
- [ ] Datos se eliminan de la base de datos

---

### Test 7.6: Ver Estadísticas
**Objetivo**: Ver página de estadísticas globales

1. Desde el menú principal, click en "Ver Estadísticas"

**Verificaciones**:
- [ ] Página se abre correctamente
- [ ] Cards de estadísticas muestran:
  - [ ] Total de Competencias
  - [ ] Total de Competidores (sumados de todas)
  - [ ] Última Competencia (fecha)
- [ ] Sección "Competencias por Área":
  - [ ] Tarjetas para cada área con contador
  - [ ] Ordenadas del 1 al 5
- [ ] Botones:
  - [ ] "Actualizar" recarga estadísticas
  - [ ] "Exportar PDF" funcional
  - [ ] "Volver al Inicio" regresa al menú

---

## Fase 8: Export/Import de Archivos

### Test 8.1: Exportar a Excel
**Objetivo**: Exportar resultados de sesión actual a Excel

1. Con competidores evaluados, click en "Exportar Excel"
2. En diálogo, seleccionar ubicación y nombre
3. Click "Guardar"

**Verificaciones**:
- [ ] Diálogo nativo de guardar archivo se abre
- [ ] Nombre por defecto: `kata_[área]_[categoría]_[timestamp].xlsx`
- [ ] Archivo se crea en ubicación seleccionada
- [ ] Toast de éxito
- [ ] Abrir archivo en Excel y verificar:
  - [ ] Header con área y categoría
  - [ ] Tabla con: Posición, Nombre, Edad, Puntaje Final
  - [ ] Ordenados por puntaje (mayor a menor)
  - [ ] Formato profesional con colores

**Casos de Error**:
- [ ] Intentar exportar sin competidores → Botón deshabilitado

---

### Test 8.2: Exportar a PDF
**Objetivo**: Exportar resultados de sesión actual a PDF

1. Click en "Exportar PDF"
2. Seleccionar ubicación y guardar

**Verificaciones**:
- [ ] Diálogo nativo se abre
- [ ] Nombre por defecto: `kata_[área]_[categoría]_[timestamp].pdf`
- [ ] Archivo se crea correctamente
- [ ] Abrir PDF y verificar:
  - [ ] Título: "Resultados Kata"
  - [ ] Información: Área, Categoría, Fecha
  - [ ] Sección "Podio" con top 3 (medallas)
  - [ ] Tabla completa de resultados
  - [ ] Formato profesional

---

### Test 8.3: Exportar Estadísticas a PDF
**Objetivo**: Exportar estadísticas globales a PDF

1. Ir a página de Estadísticas
2. Click en "Exportar PDF"
3. Guardar archivo

**Verificaciones**:
- [ ] PDF se genera con:
  - [ ] Título: "Estadísticas Generales - Kata"
  - [ ] Total de competencias
  - [ ] Total de competidores
  - [ ] Última competencia
  - [ ] Tabla de distribución por área

---

## Fase 9: Persistencia con localStorage

### Test 9.1: Recuperación después de Cerrar
**Objetivo**: Verificar que datos en sesión se recuperan

1. Agregar algunos competidores (NO guardar en DB)
2. Cerrar aplicación completamente
3. Reabrir aplicación
4. Ir a página Kata

**Verificaciones**:
- [ ] Competidores siguen en la lista
- [ ] Configuración (área, jueces, base) se mantiene
- [ ] Puntajes se mantienen

**Nota**: Esta es persistencia en localStorage, no en base de datos. Es para recuperación de sesión.

---

### Test 9.2: Reset de Sesión
**Objetivo**: Limpiar todos los datos de la sesión actual

1. Click en "Resetear"
2. Confirmar

**Verificaciones**:
- [ ] Aparece confirmación
- [ ] Lista de competidores se limpia
- [ ] Configuración vuelve a valores por defecto
- [ ] localStorage se limpia
- [ ] Toast de confirmación

---

## Fase 10: Manejo de Errores

### Test 10.1: Error al Abrir Ventana
**Objetivo**: Verificar manejo graceful de errores de ventana

**Simulación**: Este test requiere modificar temporalmente el código o forzar un error

**Verificaciones**:
- [ ] Error se captura y no crashea la app
- [ ] Toast de error informativo se muestra
- [ ] Log en consola para debugging
- [ ] App continúa funcional

---

### Test 10.2: Error en Base de Datos
**Objetivo**: Verificar manejo de errores de DB

**Simulación**: Intentar guardar con datos inválidos (si es posible)

**Verificaciones**:
- [ ] Error se maneja sin crashear
- [ ] Toast con mensaje de error se muestra
- [ ] Usuario puede continuar usando la app

---

## Fase 11: Testing de Integración End-to-End

### Test 11.1: Flujo Completo de Competencia
**Objetivo**: Simular una competencia completa de principio a fin

**Escenario**:
1. Configurar: Área 2, 5 Jueces, Base 8, "Junior Femenil"
2. Importar 8 competidoras desde Excel
3. Abrir ventana de proyección
4. Evaluar las 8 competidoras una por una
5. Descalificar una competidora (Kiken)
6. Ver resultados finales
7. Guardar competencia en DB
8. Exportar a Excel y PDF
9. Cerrar ventana de proyección
10. Ir a Historial y verificar
11. Ir a Estadísticas y verificar
12. Exportar estadísticas a PDF

**Tiempo estimado**: 10-15 minutos

**Verificaciones Finales**:
- [ ] Todo el flujo se completa sin errores
- [ ] Todos los datos son consistentes
- [ ] Archivos exportados son correctos
- [ ] Base de datos contiene la competencia
- [ ] Estadísticas se actualizan correctamente

---

### Test 11.2: Múltiples Ventanas Simultáneas
**Objetivo**: Probar manejo de múltiples ventanas de proyección

1. Abrir ventana de proyección
2. Intentar abrir otra ventana de proyección

**Verificaciones**:
- [ ] Solo puede haber una ventana de proyección abierta
- [ ] Toast informativo si se intenta abrir segunda ventana
- [ ] Primera ventana recibe el foco

---

### Test 11.3: Recuperación después de Crash
**Objetivo**: Verificar recuperación de datos después de cierre forzado

1. Iniciar competencia (agregar competidores, algunos evaluados)
2. NO guardar en DB
3. Forzar cierre de la app (kill process)
4. Reabrir app
5. Ir a página Kata

**Verificaciones**:
- [ ] Datos en localStorage se recuperan
- [ ] Competidores y puntajes están presentes
- [ ] Configuración se mantiene

---

## Criterios de Éxito Global

Para considerar el módulo Kata como completamente funcional, todos estos criterios deben cumplirse:

- [ ] ✅ Ventanas se abren/cierran sin crashes
- [ ] ✅ Sincronización entre ventanas < 500ms
- [ ] ✅ Historial persiste después de cerrar app
- [ ] ✅ Import/Export funciona con archivos reales
- [ ] ✅ No se pierden datos durante operación normal
- [ ] ✅ Build de producción se genera correctamente: `npm run tauri build`
- [ ] ✅ Todos los tests manuales pasan
- [ ] ✅ No hay errores críticos en consola
- [ ] ✅ UI es responsiva y clara
- [ ] ✅ Mensajes de error son informativos

---

## Comandos Útiles para Testing

```bash
# Modo desarrollo (con hot reload)
npm run tauri dev

# Ver logs de Rust
RUST_LOG=debug npm run tauri dev

# Build de producción
npm run tauri build

# Limpiar base de datos para testing
# Ubicación en Windows: %APPDATA%\[nombre-app]\kata_history.db
# Ubicación en Linux: ~/.local/share/[nombre-app]/kata_history.db
# Ubicación en macOS: ~/Library/Application Support/[nombre-app]/kata_history.db
```

---

## Reporte de Bugs

Si encuentras algún bug durante el testing, documenta:

1. **Pasos para reproducir**
2. **Comportamiento esperado**
3. **Comportamiento actual**
4. **Logs de consola** (si aplica)
5. **Screenshots** (si aplica)
6. **Versión del OS**

---

## Siguientes Pasos

Una vez que todos los tests del módulo Kata pasen:

1. Documentar cualquier issue encontrado
2. Fix de bugs críticos
3. Optimizaciones de performance (si necesario)
4. Comenzar implementación del módulo Kumite (usando Kata como base)

---

**Última actualización**: 2026-01-13

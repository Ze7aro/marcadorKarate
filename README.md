# Marcador Kenshukan - Aplicación de Gestión de Competencias de Karate

Aplicación desktop multiplataforma desarrollada con Tauri v2 + React 18 + TypeScript para gestionar competencias de Karate (Kata y Kumite).

## Estado del Proyecto

- ✅ **Módulo Kata**: Completamente implementado y funcional
- ⏳ **Módulo Kumite**: Pendiente de implementación

## Características del Módulo Kata

### Funcionalidades Principales

- **Gestión de Competidores**: Agregar manualmente o importar desde Excel
- **Evaluación Flexible**: Soporte para 3 o 5 jueces con cálculo automático
- **Ventana de Proyección**: Sistema multi-ventana para displays en tiempo real
- **Persistencia Completa**: Historial en SQLite + sesión en localStorage
- **Export/Import**: Exportar resultados a Excel y PDF
- **Estadísticas**: Dashboard con métricas globales

### Tecnologías Utilizadas

#### Frontend
- React 18.3.1 con TypeScript
- HeroUI v2 (componentes UI)
- Tailwind CSS v3 (estilos)
- Context API + useReducer (state management)
- XLSX (manejo de Excel)
- jsPDF + autoTable (generación de PDFs)
- react-hot-toast (notificaciones)

#### Backend
- Tauri v2 (framework desktop)
- Rust con rusqlite (base de datos)
- Plugins Tauri:
  - `tauri-plugin-store` (configuración persistente)
  - `tauri-plugin-sql` (SQLite)
  - `tauri-plugin-dialog` (file picker nativo)
  - `tauri-plugin-fs` (file system)

## Requisitos del Sistema

### Para Desarrollo

- **Node.js**: v18 o superior
- **pnpm** (recomendado) o npm
- **Rust**: v1.70+ (instalar desde [rustup.rs](https://rustup.rs/))
- **Tauri CLI**: Se instala automáticamente con las dependencias

### Para Ejecutar Build

- Windows: Windows 10+
- macOS: macOS 10.15+
- Linux: Distribuciones modernas con WebKitGTK 4.1

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd marcador-Karate
```

### 2. Instalar dependencias de Node

```bash
# Usando pnpm (recomendado)
pnpm install

# O usando npm
npm install
```

### 3. Verificar instalación de Rust

```bash
rustc --version
cargo --version
```

Si no tienes Rust instalado, descárgalo desde [rustup.rs](https://rustup.rs/).

### 4. Compilar dependencias de Rust (opcional)

```bash
cd src-tauri
cargo build
cd ..
```

## Desarrollo

### Iniciar en modo desarrollo

```bash
# Con pnpm
pnpm tauri dev

# O con npm
npm run tauri dev
```

Este comando:
1. Inicia el servidor de desarrollo de Vite
2. Compila el backend de Rust
3. Abre la aplicación en una ventana nativa

### Hot Reload

El modo desarrollo incluye hot reload automático para cambios en el frontend. Los cambios en Rust requieren recompilar.

### Ver logs de Rust

```bash
# En Windows
set RUST_LOG=debug
pnpm tauri dev

# En Linux/macOS
RUST_LOG=debug pnpm tauri dev
```

## Build de Producción

### Crear ejecutable

```bash
# Con pnpm
pnpm tauri build

# O con npm
npm run tauri build
```

Este comando genera:
- **Windows**: `.exe` + instalador `.msi` en `src-tauri/target/release/bundle/`
- **macOS**: `.app` + `.dmg` en `src-tauri/target/release/bundle/`
- **Linux**: `.AppImage`, `.deb`, o `.rpm` según configuración

### Ubicación de los builds

```
src-tauri/target/release/
├── bundle/
│   ├── msi/          (Windows)
│   ├── dmg/          (macOS)
│   └── appimage/     (Linux)
└── marcador-kenshukan[.exe]
```

## Estructura del Proyecto

```
marcador-Karate/
├── src/                          # Código fuente del frontend
│   ├── components/               # Componentes React reutilizables
│   │   ├── ErrorBoundary.tsx
│   │   ├── ExcelUploader.tsx
│   │   ├── HistorialCompetencias.tsx
│   │   └── StatsCard.tsx
│   ├── context/                  # Context providers
│   │   ├── ConfigContext.tsx
│   │   └── KataContext.tsx
│   ├── hooks/                    # Custom hooks
│   │   ├── useBroadcastChannel.ts
│   │   ├── useCrossPlatformChannel.ts
│   │   ├── useKataStats.ts
│   │   ├── useLocalStorage.ts
│   │   └── useTauriEvent.ts
│   ├── pages/                    # Páginas principales
│   │   ├── index.tsx
│   │   ├── KataPage.tsx
│   │   ├── StatsPage.tsx
│   │   └── KataComponents/       # Componentes específicos de Kata
│   │       ├── AgregarCompetidor.tsx
│   │       ├── EvaluarCompetidor.tsx
│   │       ├── ResultadosFinales.tsx
│   │       └── VentanaKata.tsx
│   ├── types/                    # Definiciones de tipos
│   │   ├── index.ts
│   │   └── events.ts
│   ├── utils/                    # Utilidades
│   │   ├── excelUtils.ts
│   │   ├── pdfUtils.ts
│   │   └── toast.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── src-tauri/                    # Código fuente del backend (Rust)
│   ├── src/
│   │   ├── commands/             # Comandos Tauri
│   │   │   ├── database.rs
│   │   │   ├── mod.rs
│   │   │   └── window.rs
│   │   ├── models/               # Estructuras de datos
│   │   │   ├── kata.rs
│   │   │   └── mod.rs
│   │   ├── utils/                # Utilidades Rust
│   │   │   ├── db_init.rs
│   │   │   └── mod.rs
│   │   └── lib.rs                # Entry point
│   ├── Cargo.toml                # Dependencias Rust
│   └── tauri.conf.json           # Configuración Tauri
├── TESTING.md                    # Guía completa de testing
├── package.json
└── README.md
```

## Configuración

### Modificar configuración de Tauri

Edita `src-tauri/tauri.conf.json`:

- **Nombre de la app**: `identifier` y `productName`
- **Permisos**: Sección `permissions`
- **Ventanas**: Tamaño, título, etc. en `windows`
- **Bundle**: Configuración de empaquetado

### Agregar nuevos comandos Rust

1. Crear función en `src-tauri/src/commands/`:

```rust
#[tauri::command]
pub fn mi_comando(param: String) -> Result<String, String> {
    Ok(format!("Recibido: {}", param))
}
```

2. Registrar en `src-tauri/src/lib.rs`:

```rust
.invoke_handler(tauri::generate_handler![
    // ... comandos existentes
    commands::mi_comando,
])
```

3. Llamar desde frontend:

```typescript
import { invoke } from '@tauri-apps/api/core';

const resultado = await invoke<string>('mi_comando', { param: 'valor' });
```

## Testing

Consulta la [Guía de Testing](./TESTING.md) para instrucciones detalladas de pruebas manuales.

### Tests rápidos

```bash
# Verificar compilación
pnpm tauri build --debug

# Test de funcionalidad básica
pnpm tauri dev
# Luego seguir los pasos en TESTING.md
```

## Base de Datos

### Ubicación de SQLite

- **Windows**: `%APPDATA%\com.kenshukan.marcador\kata_history.db`
- **macOS**: `~/Library/Application Support/com.kenshukan.marcador/kata_history.db`
- **Linux**: `~/.local/share/com.kenshukan.marcador/kata_history.db`

### Esquema

```sql
-- Tabla de competencias
CREATE TABLE competencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    fecha TEXT NOT NULL,
    tipo TEXT NOT NULL,
    area TEXT NOT NULL
);

-- Tabla de categorías
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competencia_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    FOREIGN KEY (competencia_id) REFERENCES competencias(id)
);

-- Tabla de competidores (Kata)
CREATE TABLE competidores_kata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    edad INTEGER NOT NULL,
    puntaje_final REAL,
    posicion INTEGER,
    descalificado INTEGER DEFAULT 0,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabla de puntajes de jueces
CREATE TABLE puntajes_jueces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competidor_id INTEGER NOT NULL,
    juez_numero INTEGER NOT NULL,
    puntaje REAL NOT NULL,
    FOREIGN KEY (competidor_id) REFERENCES competidores_kata(id)
);
```

## Comunicación entre Ventanas

El sistema utiliza el **Event System de Tauri** para comunicación entre la ventana principal y la de proyección.

### Eventos definidos

```typescript
export const KATA_EVENTS = {
  SYNC_STATE: 'kata:sync-state',        // Sincronizar estado completo
  UPDATE_SCORES: 'kata:update-scores',  // Actualizar puntajes
  UPDATE_COMPETITOR: 'kata:update-competitor', // Actualizar competidor
};
```

### Uso

```typescript
// Enviar evento
import { emit } from '@tauri-apps/api/event';
await emit('kata:sync-state', data);

// Escuchar evento
import { listen } from '@tauri-apps/api/event';
const unlisten = await listen('kata:sync-state', (event) => {
  console.log('Datos recibidos:', event.payload);
});
```

El hook `useCrossPlatformChannel` abstrae esto y proporciona fallback a `BroadcastChannel` para desarrollo web.

## Troubleshooting

### Error: "cargo: command not found"

Instala Rust desde [rustup.rs](https://rustup.rs/).

### Error: "WebKitGTK not found" (Linux)

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel

# Arch
sudo pacman -S webkit2gtk-4.1
```

### La ventana de proyección no sincroniza

1. Verifica que ambas ventanas estén abiertas
2. Revisa la consola para errores
3. Verifica que el indicador de conexión esté verde
4. Comprueba los logs: `RUST_LOG=debug pnpm tauri dev`

### Base de datos no se crea

1. Verifica permisos de escritura en el directorio de datos
2. Revisa logs de Rust
3. Comprueba que el plugin `tauri-plugin-sql` esté registrado correctamente

### Build falla en Windows

1. Instala Visual Studio Build Tools
2. Ejecuta: `rustup target add x86_64-pc-windows-msvc`

## Contribuir

### Convenciones de Código

- **Frontend**: ESLint + Prettier (configurado)
- **Backend**: Formato estándar de Rust (`cargo fmt`)
- **Commits**: Mensajes descriptivos en español

### Flujo de trabajo

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m "Agregar nueva funcionalidad"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Roadmap

### Fase Actual: Módulo Kata ✅

- [x] Configuración base de Tauri
- [x] Sistema de ventanas nativas
- [x] Gestión de competidores
- [x] Sistema de evaluación (3 y 5 jueces)
- [x] Ventana de proyección con sincronización
- [x] Persistencia SQLite
- [x] Historial de competencias
- [x] Export a Excel y PDF
- [x] Estadísticas globales
- [x] Testing y pulido

### Próxima Fase: Módulo Kumite ⏳

- [ ] Gestión de emparejamientos
- [ ] Sistema de timer para rounds
- [ ] Conteo de puntos en tiempo real
- [ ] Categorías de peso y edad
- [ ] Brackets de eliminación
- [ ] Ventana de proyección para Kumite
- [ ] Persistencia y estadísticas

### Futuro

- [ ] Tema personalizable
- [ ] Soporte multiidioma
- [ ] Sincronización en red (opcional)
- [ ] Impresión directa de certificados
- [ ] Integración con sistemas externos

## Licencia

[Especificar licencia]

## Contacto

[Información de contacto o links a issues/discussions]

---

**Versión actual**: 1.0.0 (Módulo Kata)
**Última actualización**: 2026-01-13

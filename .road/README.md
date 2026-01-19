# Marcador Kenshukan - Sistema de Puntuación para Karate Do

<div align="center">
  <img src="./src/assets/images/kenshukan-logo.png" alt="Kenshukan Logo" width="200"/>
  
  **Aplicación web profesional para gestionar competencias de Karate Do**
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.3.1-61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.2.0-646CFF)](https://vitejs.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## 📋 Descripción

**Marcador Kenshukan** es una aplicación web moderna diseñada específicamente para gestionar competencias de Karate Do. Permite administrar tanto eventos de **Kata** (formas) como de **Kumite** (combate), facilitando el trabajo de jueces, árbitros y organizadores de torneos.

### Características Principales

- ✅ **Gestión de Kata**: Sistema completo de evaluación con 3 o 5 jueces
- ⚔️ **Gestión de Kumite**: Control de combates con temporizador y sistema de puntuación
- 📊 **Brackets Automáticos**: Generación de llaves de eliminación
- 📁 **Importación Excel**: Carga masiva de competidores desde archivos Excel
- 🖥️ **Ventanas de Proyección**: Displays secundarios para mostrar resultados al público
- 💾 **Persistencia Local**: Guarda automáticamente el progreso de la competencia
- 🌓 **Modo Oscuro**: Interfaz adaptable a diferentes condiciones de iluminación
- 📱 **Responsive**: Funciona en computadoras, tablets y móviles

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16+
- npm, yarn, pnpm o bun

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/Ze7aro/marcadorKenshukan.git
   cd marcadorKenshukan
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

### Comandos Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de la build de producción
npm run lint     # Ejecutar linter y corregir errores
```

---

## 📖 Guía de Uso

### Módulo Kata

1. **Seleccionar Área**: Elige el área de competencia (1-5)
2. **Cargar Competidores**:
   - Opción A: Cargar desde Excel (ver formato más abajo)
   - Opción B: Agregar manualmente con el botón "+ Agregar competidor"
3. **Configurar Jueces**: Selecciona 3 o 5 jueces
4. **Configurar Puntuación Media**: Elige entre 6, 7 u 8 (determina el rango de puntajes)
5. **Evaluar Katas**: Ingresa los puntajes de cada juez
6. **Calcular**: El sistema calcula automáticamente el puntaje final
7. **Guardar**: Guarda el puntaje y pasa al siguiente competidor
8. **Proyectar**: Abre una ventana de display para mostrar al público

#### Formato Excel para Kata

| Nombre       | Edad | Kyu/Dan |
| ------------ | ---- | ------- |
| Juan Pérez   | 25   | 1er Dan |
| María García | 22   | 2do Kyu |

**Nota**: La categoría se especifica en la celda B1 del Excel.

### Módulo Kumite

1. **Seleccionar Área**: Elige el área de competencia (1-5)
2. **Cargar Competidores**: Importar desde Excel (ver formato más abajo)
3. **Configurar Tiempo**: Selecciona la duración del combate (30s, 1min, 1:30min, 2min, 3min)
4. **Generar Bracket**: El sistema crea automáticamente las llaves de eliminación
5. **Controlar Combate**:
   - Iniciar/Pausar temporizador (barra espaciadora)
   - Registrar puntos (Wazari, Ippon)
   - Aplicar penalizaciones (Kinshi, Atenai)
   - Declarar ganador (Kiken, Shikaku, Hantei)
6. **Siguiente Combate**: Avanza automáticamente al siguiente enfrentamiento
7. **Proyectar**: Abre una ventana de display para mostrar al público

#### Formato Excel para Kumite

| Nombre       | Edad |
| ------------ | ---- |
| Juan Pérez   | 25   |
| María García | 22   |
| Carlos López | 28   |
| Ana Martínez | 24   |

**Nota**: La categoría se especifica en la celda B1 del Excel.

---

## 🛠️ Stack Tecnológico

### Core

- **[Vite](https://vitejs.dev/)** - Build tool ultrarrápido
- **[React 18](https://reactjs.org/)** - Biblioteca de UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[React Router](https://reactrouter.com/)** - Navegación

### UI/UX

- **[HeroUI](https://heroui.com)** - Componentes de UI
- **[Tailwind CSS](https://tailwindcss.com)** - Estilos utilitarios
- **[Framer Motion](https://www.framer.com/motion)** - Animaciones
- **[React Hot Toast](https://react-hot-toast.com/)** - Notificaciones

### Utilidades

- **[XLSX](https://sheetjs.com/)** - Lectura de archivos Excel
- **[Zod](https://zod.dev/)** - Validación de esquemas
- **[React Hook Form](https://react-hook-form.com/)** - Manejo de formularios

### Desarrollo

- **[ESLint](https://eslint.org/)** - Linter
- **[Prettier](https://prettier.io/)** - Formateador de código

---

## 📁 Estructura del Proyecto

```
marcadorKenshukan/
├── src/
│   ├── assets/           # Imágenes, sonidos, PDFs
│   ├── components/       # Componentes reutilizables
│   │   ├── ErrorBoundary.tsx
│   │   ├── MenuComponent.tsx
│   │   └── ...
│   ├── hooks/            # Custom hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useBroadcastChannel.ts
│   │   └── useTimer.ts
│   ├── pages/            # Páginas principales
│   │   ├── index.tsx     # Página de inicio
│   │   ├── KataPage.tsx  # Módulo Kata
│   │   ├── KumitePage.tsx # Módulo Kumite
│   │   ├── KataComponents/
│   │   └── KumiteComponents/
│   ├── schemas/          # Esquemas de validación Zod
│   ├── types/            # Definiciones de TypeScript
│   ├── utils/            # Utilidades y helpers
│   │   ├── bracketUtils.ts
│   │   └── toast.ts
│   ├── App.tsx           # Componente raíz
│   └── main.tsx          # Punto de entrada
├── public/               # Assets estáticos
├── package.json
└── vite.config.ts
```

---

## 🎯 Características Técnicas

### Persistencia de Datos

- Utiliza `localStorage` para guardar automáticamente el estado de la competencia
- Los datos persisten incluso si se cierra el navegador
- Función de reset para limpiar todos los datos

### Comunicación entre Ventanas

- Usa `BroadcastChannel API` para sincronizar datos entre ventanas
- Las ventanas de proyección se actualizan en tiempo real
- Fallback a `localStorage events` para navegadores sin soporte

### Validación

- Validación de formularios con `Zod` y `React Hook Form`
- Validación de archivos Excel antes de procesar
- Mensajes de error descriptivos en español

### Manejo de Errores

- `ErrorBoundary` para capturar errores de React
- Sistema de notificaciones toast para feedback al usuario
- Logging de errores en consola (desarrollo)

---

## 🔧 Configuración Avanzada

### Configurar pnpm (opcional)

Si usas `pnpm`, agrega esto a tu `.npmrc`:

```bash
public-hoist-pattern[]=*@heroui/*
```

Luego ejecuta:

```bash
pnpm install
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_APP_TITLE=Marcador Kenshukan
VITE_APP_VERSION=1.0.0
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Roadmap

- [ ] Tests unitarios y de integración
- [ ] Exportar resultados a PDF
- [ ] Historial de competencias
- [ ] PWA con modo offline
- [ ] Estadísticas avanzadas
- [ ] Internacionalización (i18n)

---

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/Ze7aro/marcadorKenshukan/issues) con:

- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots (si aplica)
- Información del navegador y sistema operativo

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Desarrollador Principal** - [Ze7aro](https://github.com/Ze7aro)

---

## 🙏 Agradecimientos

- Kenshukan Dojo por la inspiración y feedback
- Comunidad de HeroUI por los excelentes componentes
- Todos los contribuidores del proyecto

---

<div align="center">
  Hecho con ❤️ para la comunidad de Karate Do
</div>

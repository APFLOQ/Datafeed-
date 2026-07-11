# Datafeed — Rediseño del Trading Journal

## Resumen
Rediseño completo del trading journal (antes Tapeline) a **Datafeed**: un journal con estética Liquid Glass, auth con Supabase, animaciones con anime.js y un dashboard tipo command center con tarjetas flotantes.

## Tech Stack
- **Framework:** React 18 + Vite
- **Auth:** Supabase (email/contraseña + Discord OAuth)
- **Base de datos:** PostgreSQL via Supabase (migrar desde localStorage)
- **Estilos:** Tailwind CSS v3 + tokens Liquid Glass
- **Animaciones:** anime.js
- **Componentes:** Uiverse.io (principal) + Reactbits.dev (complementario)
- **Gráficos:** Recharts (sin cambios)

## Marca
- **Nombre:** Datafeed
- **Tipografía:** Fustat (títulos/marca), Inter (cuerpo/UI)
- **Tagline:** *Track, Analyze, Evolve*

## Sistema de Diseño — Liquid Glass

### Colores
- **Fondo:** Blanco puro (#FFFFFF) con glow azul degradado sutil (esquina superior izquierda)
- **Superficies glass:** rgba(255,255,255,0.3) con backdrop-blur(50px)
- **Bordes glass:** 1px solid rgba(0,0,0,0.1)
- **Sombra interna glass:** inset 0px 4px 4px 0px rgba(255,255,255,0.25)
- **Azul acento:** #0084FF (CTAs principales)
- **Azules claros:** #60B1FF, #319AFF (glows degradados)
- **Texto oscuro:** near-black para alto contraste sobre glass
- **Ganancia:** #4FAE7C
- **Pérdida:** #E0685A

### Tokens de glassmorphism (Tailwind)
```css
glass: {
  DEFAULT: 'rgba(255,255,255,0.3)',
  dark: 'rgba(0,0,0,0.1)',
  border: 'rgba(0,0,0,0.1)',
}
blur: {
  glass: '50px',
}
```

### Escala Tipográfica
- Hero headline: 75px, Fustat Bold, tracking -2px, leading 1.05
- H1: 48px Fustat Bold
- H2: 32px Fustat Bold
- H3: 24px Inter SemiBold
- Body: 16px Inter Regular
- Small: 14px Inter
- Micro: 12px Inter
- Mono: IBM Plex Mono (números de trading, P&L)

## Páginas

### 1. Landing Page (Pública)
- **Navbar:** Sticky top-[30px], centrado, w-fit, superficie glass, logo "Datafeed" (Fustat), links de navegación, botón Sign Up glass
- **Hero:**
  - Izquierda: Tagline + subtítulo + CTA "Get Started" + prueba social (estrellas)
  - Derecha: Orb animado glass (animación CSS, sin video)
  - Footer: "Trusted by" strip de logos
- **Sección Features:** 3-4 tarjetas glass con features clave (Equity Curve, Analytics, Trade Log, Pre-Market)
- **Sección CTA:** Último llamado a registro con tarjeta glass
- **Footer:** Links, invitación a Discord

### 2. Auth (Supabase)
- Modal o página dedicada
- Dos opciones: **Email + Contraseña** | **Continuar con Discord**
- Inputs estilo glass con floating labels
- Opción de magic link para email

### 3. Dashboard (Autenticado) — Command Center
Dashboard full-width con tarjetas glass flotantes en grid libre responsive:

#### Top Bar
- Logo "Datafeed"
- Avatar + email del usuario (dropdown: Settings, Logout)
- Filtro de rango de fechas

#### Grid de Tarjetas
Cada módulo es una tarjeta glass:

1. **Equity Curve Card** — Grande, ocupa 2 columnas. Gráfico de línea del P&L acumulado.
2. **Stats Strip** — Mini tarjetas glass: P&L Total, Win Rate, Profit Factor, Sharpe, Sortino
3. **Calendar Card** — Calendario mensual tipo heatmap de días operados
4. **Trade Table Card** — Tabla de trades scrolleable y ordenable
5. **Analytics Card** — Tabs: Resumen, Conducta, Cuantitativo, Rachas, Cruzados, Volatilidad, Premarket, Visual
6. **Pre-Market Card** — Lista de fichas con gauge de fidelidad al plan
7. **Playbook Card** — CRUD de estrategias

#### Sidebar (colapsable, glass)
Iconos solos cuando colapsado, expandido muestra etiquetas. Secciones: Dashboard, Trades, Analytics, Pre-Market, Playbook, Settings.

## Flujo de Auth (Supabase)

### Configuración Necesaria
1. Proyecto Supabase: `datafeed`
2. Activar email auth provider
3. Activar Discord OAuth (client ID + secret desde Discord Developer Portal)
4. Ejecutar SQL de migración para tablas:
   ```sql
   -- users, trades, premarkets, strategies, screenshots
   ```
5. Configurar políticas RLS por tabla

### Migración de Datos
- Exportar datos actuales de localStorage a JSON
- Importar vía dashboard de Supabase o script seed
- Usuarios nuevos empiezan en limpio

## Animaciones (anime.js)

### Landing Page
- Título del hero: texto stagger reveal (caracteres aparecen de abajo)
- Tarjetas glass: fade + translateY al hacer scroll
- Orb: rotación lenta continua + pulso
- Navbar: shimmer sutil en el borde glass

### Dashboard
- Entrada de tarjetas: stagger fade-up al cargar el dashboard
- Contadores: animar números al montar (ej. $1,234 anima hacia arriba)
- Transiciones de gráficos: anime.js sincronizado con Recharts
- Sidebar: slide suave de iconos + labels al expandir/colapsar
- Modales: glass blur + scale transition al abrir
- Hover: scale(1.02) + aumento de sombra en tarjetas glass

## Plan de Implementación

### Fase 1 — Fundación
1. Instalar dependencias: anime.js, @supabase/supabase-js
2. Configurar tokens Liquid Glass en Tailwind
3. Crear utilidad de Supabase (`src/lib/supabase.js`)
4. Crear contexto/hook de auth (`src/hooks/useAuth.js`)
5. Crear estructura de componentes del landing
6. Construir Navbar glass
7. Construir Hero section

### Fase 2 — Auth
8. Construir modal de Auth (email + Discord)
9. Conectar funciones de signup/signin con Supabase
10. Probar flujo de auth completo
11. Crear wrapper de rutas protegidas

### Fase 3 — Rediseño del Dashboard
12. Construir componente GlassCard reutilizable
13. Construir TopBar glass
14. Construir Sidebar glass colapsable
15. Rediseñar Dashboard con grid de tarjetas glass
16. Rediseñar cada subtab de analytics
17. Añadir animaciones de entrada con anime.js

### Fase 4 — Migración a Base de Datos
18. Crear tablas en Supabase + políticas RLS
19. Migrar datos de localStorage a Supabase
20. Actualizar hooks para usar Supabase en vez de localStorage
21. Añadir sync en tiempo real para trades

### Fase 5 — Pulido
22. Añadir micro-interacciones con anime.js (hover, contadores, scroll)
23. Breakpoints responsive
24. Estados de carga + skeletons
25. Manejo de errores + notificaciones

## Archivos a Crear/Modificar

### Nuevos Archivos
- `src/lib/supabase.js` — Cliente de Supabase
- `src/hooks/useAuth.js` — Contexto + hook de auth
- `src/pages/Landing.jsx` — Landing page
- `src/pages/Dashboard.jsx` — Dashboard principal
- `src/pages/AuthPage.jsx` — Modal/página de auth
- `src/components/Auth/LoginForm.jsx`
- `src/components/Auth/DiscordButton.jsx`
- `src/components/Landing/Navbar.jsx`
- `src/components/Landing/Hero.jsx`
- `src/components/Landing/Features.jsx`
- `src/components/Landing/CtaSection.jsx`
- `src/components/Landing/Footer.jsx`
- `src/components/Dashboard/GlassCard.jsx`
- `src/components/Dashboard/TopBar.jsx`
- `src/components/Dashboard/Sidebar.jsx`
- `src/components/Dashboard/EquityCurveCard.jsx`
- `src/components/Dashboard/StatsCardGrid.jsx`
- `src/styles/glass.css` — Utilidades glassmorphism

### Archivos a Modificar
- `tailwind.config.js` — Nuevos tokens
- `src/main.jsx` — Router + Auth provider
- `src/index.css` — Estilos glass + tipografía
- `package.json` — Nuevas dependencias
- `src/hooks/useJournal.js` — Integración con Supabase

## Criterios de Éxito
1. Landing page carga con estética Liquid Glass
2. Usuario puede registrarse con email o Discord
3. Dashboard muestra grid de tarjetas glass con todos los módulos
4. Todos los datos persisten en Supabase (no localStorage)
5. Animaciones de anime.js se disparan en carga, scroll e interacción
6. Build pasa sin errores
7. Responsive en mobile (tarjetas se apilan verticalmente)

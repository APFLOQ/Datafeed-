# Tapeline — Diario de Trading Institucional (Core Convexity)

Diario de trading en React con auditoría conductual automática, checklist de Order Flow,
fichas de Pre-Market, capturas por etapas y un panel de analítica cuantitativa avanzado.

## Cómo correrlo

1. Descomprime el `.zip`.
2. Necesitas [Node.js](https://nodejs.org/) 18+.
3. Dentro de la carpeta `trading-journal`:
   ```bash
   npm install
   npm run dev
   ```
4. Se abre en `http://localhost:5173`.

Los datos se guardan en el `localStorage` de tu navegador (persisten entre sesiones en esa misma máquina/navegador).

## Qué incluye

- **Calendar / Trades / Playbook** — vista mensual de P&L, lista de operaciones, gestión de estrategias.
- **Pre-Market** — ficha diaria con sesgo, niveles HVL/LVN/POC, VIX/ATR, estructura del día anterior e inventario overnight.
- **Formulario de trade extendido**:
  - Segmentación de activo (Futuros/Opciones, Mini/Micro).
  - Checklist de convicción en Order Flow (Delta, absorción pasiva, imbalance, divergencia, reacción en niveles de volumen).
  - Auditoría MAE/MFE: precio planeado vs. real, stop planeado, MFE/MAE, contexto de cierre, hora de entrada/salida.
  - "Modo Espejo": compara el trade en vivo contra tu ficha de Pre-Market del mismo día/ticker.
  - Capturas por etapas (contexto, trigger, post-trade) con notas y lightbox.
- **Analytics**, dividido en 8 sub-pestañas:
  - **Resumen** — P&L, win rate, profit factor, equity curve, por estrategia y por emoción.
  - **Auditoría MAE/MFE** — chasing vs. alta convicción, eficiencia de salida, matriz de coherencia emocional, tolerancia al stop.
  - **Cuantitativo y Riesgo** — skewness, Sharpe y Sortino en puntos, aislamiento de cisnes negros (peor 5%), métrica de hard-stop.
  - **Rachas y Sesgos** — detección de revenge trading, exceso de confianza, atribución de alfa por franja horaria.
  - **Filtros Cruzados** — ruido (trades impulsivos), rendimiento por catalizador, eficiencia Mini vs. Micro, inventario overnight, tipos de día, rendimiento por duración, métricas universales.
  - **Régimen de Volatilidad** — profit factor y win rate segmentados por VIX/ATR.
  - **Fidelidad al Plan** — índice de fidelidad al Pre-Market, eficiencia por zona estructural, desviación de sesgo.
  - **Revisor Visual** — filtra capturas de "trigger" por diagnóstico (chasing, salida por miedo, etc.) para auditar patrones visuales.

## Notas sobre los umbrales

Algunos diagnósticos automáticos (p. ej. qué cuenta como "chasing", tolerancia de zona estructural, cortes de VIX)
usan umbrales razonables definidos en la constante `THRESHOLDS` al inicio de `TradingJournal.jsx`. Ajústalos ahí
si tu instrumento o estilo requiere otra sensibilidad.

## Estructura

```
trading-journal/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── storagePolyfill.js   (emula window.storage sobre localStorage)
    └── TradingJournal.jsx    (toda la app)
```

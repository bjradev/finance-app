![Screenshot 2025-10-29 at 12 54 40 AM](https://github.com/user-attachments/assets/661b50de-63f9-4e38-b695-763db98ef5dc)

# Finance Tracker App - Bryant Reyes
> Aplicación de control financiero personal con ingresos, gastos, conversión multi-moneda y analítica mensual.

**Revisor técnico asociado a esta prueba:**
GitHub: [github.com/carlospujolima](https://github.com/carlospujolima)

**Fecha de entrega:** miércoles 29 de octubre de 2025 – 12:00 PM (GMT-5)

---

## Descripción general

Esta app permite a un usuario:

* Registrar transacciones de tipo **ingreso** o **gasto**.
* Guardar cada transacción en una moneda específica (USD, COP, etc.).
* Ver todo convertido a una **moneda de visualización** seleccionada.
* Ver métricas del mes actual:

  * **Total disponible**
  * **Ingresos del mes**
  * **Egresos del mes**
* Visualizar un gráfico diario de ingresos vs egresos.
* Filtrar movimientos por titulo, tipo, categoría y fecha.

---

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone [https://github.com/bjradev/finance-tracker.git](https://github.com/bjradev/finance-app.git)
cd finance-tracker
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Variables de entorno

Ingresa a /apps/web-client y crea un archivo `.env.local` en la raíz con las siguientes claves (ejemplo):

```bash
VITE_SUPABASE_URL=<tu-url-de-supabase>
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

### 4. Ejecutar en modo desarrollo (desde apps/web-client/)

```bash
npm run dev
# o
yarn dev
```

Tu app queda disponible en `http://localhost:5173` (o el puerto que defina tu bundler).

### 5. Build de producción (desde apps/web-client/)

```bash
npm run build
npm run preview
```

---

## Pruebas unitarias (desde apps/web-client/)

### Ejecutar pruebas

```bash
npm run test
# o
yarn test
```

---

## Arquitectura / Decisiones técnicas

La app sigue una arquitectura feature-based, donde cada feature de negocio vive aislada dentro de src/features. La lógica, hooks, servicios y pantallas de esa feature se mantienen juntas, en vez de estar todo global.

```txt
apps/web-client/
  src/
    __tests__/           # Pruebas unitarias de la lógica crítica
    app/                 # Configuración de la app
    assets/              # Íconos, imágenes, estilos globales
    features/
      auth/              # (auth)
      dashboard/
        components/      # UI específica del dashboard (cards KPI, tabla, chart)
        hooks/           # Hooks de dominio
        logic/           # Lógica pura/calculadora
        pages/           # Páginas de esta feature
        services/        # Acceso a datos y reglas de negocio
        validation/      # Validación de inputs / schemas
        index.ts         # Punto de export de la feature
    shared/
      components/        # Componentes reutilizables y atómicos (UI genérica)
      lib/               # Clientes/config global (ej. Supabase client, helpers comunes)
      types/             # Tipos globales TS que usan varias features
    styles/              # Estilos globales
    App.tsx
    main.tsx
    setupTests.ts        # Config de pruebas (mocks, environment)
```

Usé arquitectura feature-based porque agrupa lógica de negocio, vista, servicios y estado por funcionalidad (dashboard, auth, etc.), en lugar de mezclar todo globalmente. Eso hace el código más escalable, más testeable y más fácil de portar a otras plataformas (ej. mobile) sin reescribir la lógica financiera.

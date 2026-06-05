# Decisiones de Diseño — StellArt

## 1. Arquitectura General

StellArt sigue una arquitectura **cliente-servidor** con tres capas principales:

- **Frontend**: SPA en React servida por Vite.
- **Backend**: API REST en Go con comunicación WebSocket para chat en tiempo real.
- **Base de datos**: PostgreSQL gestionada por Supabase (auth, storage y base de datos).

El monorepo se organiza en:

- `frontend/stellart-frontend/` — Aplicación React.
- `backend/` — Servidor Go.
- `supabase/` — Esquema SQL de la base de datos.
- `e2e/` — Tests end-to-end con Playwright.
- `Dockerfile` + `fly.toml` — Despliegue del backend en Fly.io.

---

# Frontend

## 2. Stack Tecnológico del Frontend

- **React 19** con **Vite 7** como bundler, usando el plugin SWC para compilación rápida.
- **Tailwind CSS 4** integrado directamente via plugin de Vite (`@tailwindcss/vite`), sin fichero de configuración separado.
- **Supabase Client** (`@supabase/supabase-js`) para autenticación y almacenamiento de ficheros (buckets `artworks` y `profile_avatars`).
- **Stripe** (`@stripe/react-stripe-js`) para el procesamiento de pagos en el cliente.

## 3. Estructura del Frontend

**SPA con enrutado cliente** usando React Router v7. Todas las rutas se definen centralizadas en `App.jsx` y comparten un componente `Layout` que envuelve Header + contenido + Footer.

La estructura de carpetas sigue una separación por responsabilidad:

- `pages/` — Componentes de página (1 por ruta): Landing, Explore, Profile, CommissionDetail, etc.
- `components/` — Componentes reutilizables (PaymentModal, ExploreGallery, SkillBar, ConfirmDialog...).
- `components/ui/` — Primitivos de UI (Button, Input, Textarea, Combobox, Avatar, DropdownMenu).
- `components/layout/` — Layout, Header y Footer.
- `service/` — Capa de acceso a datos centralizada en un único fichero `apiService.js`.
- `utils/` — Funciones utilitarias puras (e.g. `paymentUtils.js` con validación Luhn de tarjetas).
- `lib/` — Utilidad `cn()` (clsx + tailwind-merge) para composición de clases CSS.

## 4. Gestión de Estado

Se optó por **estado local** con `useState` y `useEffect` en cada componente, sin gestor de estado global (Redux, Zustand, Context API). Esto simplifica la aplicación al no requerir boilerplate adicional, siendo viable dado el tamaño del proyecto.

Los likes del usuario se persisten en `localStorage` como caché local (`stellart_likes_{userId}`).

## 5. Sistema de UI

Se sigue el patrón de **shadcn/ui**: componentes basados en **Radix UI** (Avatar, DropdownMenu, Slot) estilizados con Tailwind y organizados con **CVA** (class-variance-authority) para variantes tipadas del botón (default, destructive, outline, ghost, etc.). La función `cn()` permite fusionar clases de Tailwind sin conflictos.

Se utiliza **GSAP** para animaciones avanzadas (e.g. landing page).

## 6. Notificaciones

Se usa **Sonner** como sistema de toasts, configurado globalmente en `App.jsx` con posición bottom-right y estilos personalizados (bordes redondeados, tipografía grande).

## 7. Identidad Visual

- Paleta basada en **slate** (grises azulados) y **yellow-400/500** como color de acento.
- Tipografía sans-serif del sistema con peso black (`font-black`) para headings.
- Estilo minimalista con bordes redondeados grandes (`rounded-2xl`, `rounded-3xl`), sombras sutiles y transiciones suaves.
- Header sticky con backdrop blur (`bg-white/80 backdrop-blur-md`).

---

# Backend

## 8. Stack Tecnológico del Backend

- **Go 1.25** como lenguaje del servidor, elegido por su rendimiento, tipado fuerte y bajo consumo de memoria.
- **Chi v5** como router HTTP, ligero y compatible con el estándar `net/http`.
- **PostgreSQL** (Supabase) como base de datos relacional, accedida directamente mediante `database/sql` y el driver `lib/pq` (sin ORM).
- **Stripe Go SDK** (`stripe-go/v82`) para la gestión de pagos del lado servidor.
- **Gorilla WebSocket** para el chat en tiempo real entre compradores y artistas.

## 9. Arquitectura del Backend

Se sigue una **arquitectura en capas** con inyección de dependencias manual en `main.go`:

- `handler/` — Controladores HTTP que parsean requests y delegan en servicios.
- `service/` — Lógica de negocio (pagos, comisiones, detección IA, emails, chat).
- `database/repository/postgres/` — Implementaciones concretas de acceso a datos con SQL.
- `database/repository/uis/` — Interfaces de repositorio que permiten desacoplar la capa de datos.
- `database/models/` — Structs Go que representan las entidades del dominio.
- `dto/` — Data Transfer Objects para requests/responses de la API.
- `middleware/` — Middleware de autenticación (Bearer token).
- `settings/` — Carga de configuración desde variables de entorno.

La inyección de dependencias se realiza de forma explícita en `main.go`: cada repositorio se instancia y se pasa a su servicio, y cada servicio a su handler. Esto mantiene el código simple y testeable sin frameworks de DI.

## 10. API REST

La API expone los siguientes grupos de recursos bajo Chi:

- `/profiles` — CRUD de perfiles, skills, wishlist y ranking de artistas.
- `/artworks` — CRUD de obras, búsqueda semántica, trending, likes y reportes.
- `/commissions` — Flujo completo de comisiones: creación → aceptación → pago anticipado → trabajo → revisiones → aprobación → pago restante → reembolsos.
- `/addresses` — CRUD de direcciones de envío.
- `/orders` — Creación y seguimiento de pedidos (creado → enviado → entregado).
- `/payments/create-intent` — Creación de PaymentIntents de Stripe.
- `/webhooks/stripe` — Webhook para eventos de Stripe.
- `/ws/chat` — WebSocket para chat en tiempo real.
- `/healthz` — Health check para el despliegue.

CORS se configura dinámicamente desde la variable de entorno `ALLOWED_ORIGINS`.

## 11. Pagos con Stripe

El flujo de pagos es **server-side first**:

1. El frontend solicita un `PaymentIntent` al backend (`POST /payments/create-intent`).
2. El backend crea el intent via Stripe API y devuelve el `client_secret`.
3. El frontend confirma el pago con `stripe.confirmCardPayment()` usando Stripe Elements individuales (`CardNumberElement`, `CardExpiryElement`, `CardCvcElement`).
4. Stripe notifica al backend via webhook (`POST /webhooks/stripe`).

Las comisiones soportan **pagos parciales**: un anticipo del 50% al aceptar y el restante al completar. Ambos pagos se gestionan como PaymentIntents independientes. El backend también soporta reembolsos vía `stripe.Refunds`.

El locale de Stripe Elements se fuerza a inglés (`locale: 'en'`) para consistencia en los mensajes de error.

## 12. Detección de Arte por IA

El backend incluye un servicio de detección de imágenes generadas por IA usando **ONNX Runtime**. Se carga un modelo de red neuronal (`ai_detector.onnx`) que clasifica imágenes en "humano" vs "IA" mediante preprocesamiento estándar (resize 224×224, normalización ImageNet). La librería nativa de ONNX Runtime se selecciona automáticamente según el SO (`.dylib` para macOS, `.so` para Linux, `.dll` para Windows).

## 13. Búsqueda Semántica

Las obras se indexan con **embeddings vectoriales** generados por la API de **Cohere** (modelo `embed-english-v3.0`, dimensión 1024). Esto permite buscar obras por similitud semántica usando distancia vectorial en PostgreSQL (pgvector), no solo por coincidencia textual.

## 14. Emails

Se utiliza **Resend** como servicio de envío de emails transaccionales (formulario de contacto). Los emails se generan con templates HTML inline en Go usando `html/template`.

## 15. Chat en Tiempo Real

El chat entre compradores y artistas dentro de una comisión se implementa via **WebSocket** (`/ws/chat`), con mensajes persistidos en PostgreSQL. La conexión se establece con `commission_id` y `sender_id` como query params.

---

# Infraestructura y Testing

## 16. Despliegue

El backend se despliega en **Fly.io** mediante un Dockerfile multi-stage:

1. **Build stage**: Compila el binario Go con CGO habilitado (necesario para ONNX Runtime).
2. **Runtime stage**: Imagen mínima `debian:bookworm-slim` con el binario, el modelo ONNX y las librerías nativas.

## 17. Variables de Entorno

Los ficheros `.env` se ubican en la raíz del monorepo, compartidos entre frontend y backend. El frontend accede via `VITE_*` (prefijo de Vite) y el backend via `os.Getenv`. Variables clave: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `COHERE_API_KEY`, `RESEND_API_KEY`, `ALLOWED_ORIGINS`.

## 18. Testing

- **Frontend**: Vitest + Testing Library (jsdom). Cobertura con v8, excluyendo `pages/`. Dependencias externas (Stripe, Supabase, Sonner) se mockean.
- **Backend**: Tests en Go (`test/handler/`) que cubren handlers, servicios y la integración con Stripe.
- **E2E**: Playwright (TypeScript) con tests end-to-end que validan flujos completos del usuario.

## 19. Modelo de Dominio

Las entidades principales y sus relaciones:

- **Profile** — Usuario con skills, biografía y avatar.
- **Artwork** — Obra de arte con imagen, precio, tags, embedding vectorial y contador de likes.
- **Commission** — Encargo con ciclo de vida completo: `pending → accepted → in_progress → review → revised → completed` (o `cancelled`/`refunded`).
- **AdvancePayment / RemainingPayment** — Pagos parciales vinculados a una comisión, con estados `pending → paid → released → refunded`.
- **WorkUpload** — Entregas del artista con soporte para marca de agua.
- **CommissionRevision** — Solicitudes de revisión con estados `pending → approved / rejected`.
- **Order** — Pedido de compra directa de artwork con dirección de envío.
- **Address** — Dirección de envío del usuario.
- **ChatMessage** — Mensajes del chat en tiempo real dentro de una comisión.

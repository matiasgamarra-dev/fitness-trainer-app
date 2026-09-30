# 🚀 Deployment

Guía para deployar Fitness Trainer App a producción.

## Servicios

| Componente | Servicio | Tier |
|---|---|---|
| **Frontend** | Vercel | Free |
| **Backend** | Railway | Free |
| **Base de datos** | Supabase | Free |
| **Auth** | Supabase Auth | Free |

## Deploy del backend (Railway)

### 1. Crear proyecto

1. Ir a [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → `fitness-trainer-app`

### 2. Configurar servicio

- **Root Directory:** `apps/api`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 3. Variables de entorno

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Deploy del frontend (Vercel)

### 1. Crear proyecto

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**
2. Importar `fitness-trainer-app`
3. Configurar:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2. Variables de entorno

```env
VITE_SUPABASE_URL=https://ourssnznqjladulhmpeq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Configurar dominios

### Supabase

**Authentication → URL Configuration:**
- **Site URL:** `https://tu-app.vercel.app`
- **Redirect URLs:** `https://tu-app.vercel.app/auth/callback`, `http://localhost:5173/auth/callback`

### Google Cloud

**APIs & Services → Credentials → OAuth 2.0 Client:**
- **Authorized redirect URIs:** agregar `https://tu-app.vercel.app/auth/callback`
- **Authorized JS origins:** agregar `https://tu-app.vercel.app`

## Verificar el deploy

- [ ] `https://tu-api.up.railway.app/api/v1/health` responde OK
- [ ] `https://tu-app.vercel.app` carga Login
- [ ] Login con Google funciona
- [ ] Login con email funciona
- [ ] Dashboard se muestra después de loguearse
- [ ] Logout funciona

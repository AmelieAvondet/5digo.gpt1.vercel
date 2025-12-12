# Configuración de Verificación de Email en Supabase

Este documento explica cómo configurar la verificación de email en tu proyecto Supabase.

## Pasos de Configuración

### 1. Habilitar Email Confirmation en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Authentication** → **Settings**
3. En la sección **Email Auth**, asegúrate de que **Enable Email Confirmations** esté **activado**

### 2. Configurar URL de Redirección

1. En **Authentication** → **URL Configuration**
2. Agrega las siguientes URLs en **Redirect URLs**:
   - Para desarrollo: `http://localhost:3000/auth/callback`
   - Para producción: `https://tu-dominio.com/auth/callback`

### 3. Configurar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga la variable:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Para producción, cambia esto a tu URL de producción:

```env
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### 4. Configurar Template de Email (Opcional)

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Confirm signup**
3. Personaliza el template si lo deseas. El enlace de confirmación por defecto funciona correctamente.

## Flujo de Verificación

1. **Registro**: Usuario se registra con email y contraseña
2. **Email enviado**: Supabase envía automáticamente un email de confirmación
3. **Usuario hace clic**: El usuario hace clic en el enlace del email
4. **Confirmación**: El enlace redirige a `/auth/callback` que verifica el token
5. **Redirección**: Usuario es redirigido a su dashboard según su rol

## Probar la Funcionalidad

### En Desarrollo (localhost)

Para probar en localhost, puedes:

1. **Opción 1**: Usar un servicio SMTP de prueba como [Ethereal Email](https://ethereal.email/)
2. **Opción 2**: Configurar Supabase para usar tu propio SMTP
3. **Opción 3**: Ver los enlaces de confirmación en los logs de Supabase

#### Ver enlaces de confirmación en Supabase Logs:

1. Ve a **Authentication** → **Users** en el dashboard
2. Busca el usuario recién registrado
3. El estado debe mostrar "Waiting for verification"
4. Para desarrollo, puedes copiar el enlace de confirmación de los logs

### Configurar SMTP Personalizado (Recomendado para producción)

1. Ve a **Project Settings** → **Auth**
2. En **SMTP Settings**, configura:
   - Host SMTP (ej: smtp.gmail.com)
   - Puerto (ej: 587)
   - Usuario
   - Contraseña
   - Remitente (From Email)

## Seguridad

- Los usuarios **no podrán iniciar sesión** hasta verificar su email
- Los tokens de verificación expiran después de 24 horas
- Los enlaces de verificación solo pueden usarse una vez

## Solución de Problemas

### Email no llega
- Revisa carpeta de spam
- Verifica configuración SMTP en Supabase
- Revisa los logs de Supabase en **Logs** → **Auth Logs**

### Error en callback
- Verifica que la URL de callback esté en la lista de Redirect URLs
- Asegúrate de que `NEXT_PUBLIC_APP_URL` esté configurado correctamente
- Revisa la consola del navegador para errores

### Usuario ya registrado pero sin verificar
- El usuario debe hacer clic en el enlace de verificación
- Puedes reenviar el email desde el dashboard de Supabase
- O implementar una función de "Reenviar email de verificación"

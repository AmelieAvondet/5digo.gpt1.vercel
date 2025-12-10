#!/bin/bash
# Script de verificación pre-deploy

echo "🔍 Verificando proyecto..."

# Verificar que existen los archivos clave
files=(
  "src/app/page.tsx"
  "src/app/action.ts"
  "src/app/login/page.tsx"
  "src/app/register/page.tsx"
  "src/app/chat/page.tsx"
  "src/app/chat/action.ts"
  "src/app/chat/loader.ts"
  "src/app/admin/actions.ts"
  "src/app/admin/topics/page.tsx"
  "lib/supabase.ts"
  "middleware.ts"
  ".env.local"
  ".env.example"
  "schema.sql"
  "package.json"
)

missing=0
for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Falta: $file"
    ((missing++))
  fi
done

if [ $missing -eq 0 ]; then
  echo "✅ Todos los archivos están presentes"
else
  echo "⚠️ Faltan $missing archivos"
fi

# Verificar variables de entorno
echo ""
echo "🔐 Verificando variables de entorno..."
if [ -f ".env.local" ]; then
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL configurada"
  fi
  if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    echo "✅ SUPABASE_SERVICE_ROLE_KEY configurada"
  fi
  if grep -q "GEMINI_API_KEY" .env.local; then
    echo "✅ GEMINI_API_KEY configurada"
  fi
  if grep -q "JWT_SECRET" .env.local; then
    echo "✅ JWT_SECRET configurada"
  fi
else
  echo "❌ Falta .env.local"
fi

echo ""
echo "✨ Verificación completada"

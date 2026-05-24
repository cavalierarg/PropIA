---
name: push-all
description: Verificá, comiteá y hacé push de todos los cambios con checklist de seguridad. Usá cuando querés subir cambios a GitHub al terminar una tarea.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git pull:*), Bash(git branch:*), Bash(npx tsc:*)
disable-model-invocation: false
---

# Push All — Commit seguro y push a GitHub

## Pasos

### 1. Analizá el estado actual (en paralelo)
- `git status` — archivos modificados, nuevos, eliminados
- `git diff --stat` — estadísticas de cambios
- `git log --oneline -3` — últimos commits para seguir el estilo

### 2. Verificación de seguridad (BLOQUEANTE)

Revisá los archivos modificados. Si encontrás alguno de los siguientes, **DETENÉ y avisá al usuario**:
- `.env*`, `*.key`, `*.pem`, `credentials.json`
- Valores reales de API keys (no placeholders como `your-key-here`)
- node_modules/, dist/, .next/ en archivos untracked sin .gitignore

### 3. Verificación de TypeScript
```bash
npx tsc --noEmit
```
Si hay errores de tipos, **NO hacer push**. Mostrá los errores y pedí que se corrijan primero.

### 4. Pedí confirmación

Mostrá este resumen antes de proceder:
```
📊 Cambios:
  - X archivos modificados, Y nuevos, Z eliminados

🔒 Seguridad: ✅ Sin secretos detectados
🔷 TypeScript: ✅ Sin errores de tipos
🌿 Branch: [nombre] → origin/[nombre]

¿Procedo con git add . → commit → push?
```

Esperá confirmación explícita del usuario.

### 5. Ejecutá (solo con confirmación)

```bash
git add .
git status  # verificar staging
```

### 6. Generá el mensaje de commit

Analizá los cambios y creá un commit en formato convencional:

**Tipos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Scope:** el módulo o feature afectado entre paréntesis

**Ejemplo:**
```
feat(generador-ads): agregar selección de objetivo de campaña

- Nuevo campo "objetivo" (awareness/tráfico/conversión)
- Prompt actualizado para personalizar copy según objetivo
- Validación con Zod en server action
```

### 7. Comiteá y pusheá

```bash
git commit -m "$(cat <<'EOF'
[mensaje generado]
EOF
)"
git push
git log --oneline -1 --decorate
```

### 8. Confirmá el éxito

```
✅ Push exitoso a GitHub

Commit: [hash] [mensaje]
Branch: [branch] → origin/[branch]
Archivos: X cambiados (+inserciones, -eliminaciones)
```

## Manejo de errores

- **tsc falla**: corregí los errores antes de continuar
- **push rechazado (non-fast-forward)**: `git pull --rebase && git push`
- **rama sin upstream**: `git push -u origin [branch]`
- **secreto detectado**: no proceder, removelo del commit staging

## Convenciones de PropIA

- Mensajes en español o inglés (lo que sea más natural para el cambio)
- Scope: `generador`, `ads`, `reels`, `calendario`, `portal`, `auth`, `ui`, `api`, `db`
- No incluir `Co-Authored-By: Claude` salvo que el usuario lo pida explícitamente

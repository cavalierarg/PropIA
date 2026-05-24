---
name: commit
description: Creá un commit con mensaje convencional basado en los cambios actuales. Usá cuando querés commitear sin hacer push todavía.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
argument-hint: [mensaje opcional]
---

## Contexto actual

- Estado: !`git status`
- Cambios: !`git diff HEAD`
- Branch: !`git branch --show-current`
- Últimos commits: !`git log --oneline -5`

## Tu tarea

Analizá los cambios y creá un commit con mensaje en formato convencional.

Si se pasó un mensaje como argumento, usalo directamente: $ARGUMENTS

Si no, generá uno siguiendo este formato:
```
tipo(scope): descripción corta en español (máx 72 chars)

- Detalle 1
- Detalle 2
```

**Tipos:** `feat` · `fix` · `refactor` · `docs` · `style` · `test` · `chore` · `perf`

**Scopes de PropIA:** `generador` · `ads` · `reels` · `calendario` · `portal` · `auth` · `ui` · `api` · `db`

Usá `git add .` antes del commit si hay archivos sin stagear.

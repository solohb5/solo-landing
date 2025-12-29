# AGENTS.md — Solo Canvas

This file defines how AI agents work in this project.

---

## The Workflow

```
PLAN (Wizard) → BUILD (Claude Code) → POLISH (Cursor) → SHIP
```

**Cursor** = You drive, AI assists (quick edits, visual review)
**Claude Code** = AI drives, you supervise (multi-file, autonomous)

Use both. They're a tag team.

---

## When to Switch to Claude Code

Say: *"This needs Claude Code"* when:
- Building a feature from scratch
- Multi-file refactoring  
- Running tests and fixing all failures
- Git operations (commit, PR)
- "Do this whole thing autonomously"

Run `claude` in terminal.

---

## Project Context

**Solo Canvas** — Premium landing page for Solo Designs studio

**Stack:**
- React 19 + TypeScript
- Vite 7 + Tailwind CSS 4
- Framer Motion animations
- Express backend (minimal)

---

## Available Agents

### 🏛️ Architect (Opus)
**Use for:** Planning features, refactoring, structural decisions
**Trigger:** "I need architecture help with..."

### 🐛 Debugger (Sonnet)
**Use for:** Hunting bugs, diagnosing issues
**Trigger:** Something is broken or behaving unexpectedly

### 👁️ Reviewer (Sonnet)
**Use for:** Code review before shipping
**Trigger:** "Review this code" or after completing a feature

---

## Available Skills

### 🎯 Interpreter (Always Active)
Transforms casual requests into world-class prompts. You never call this — it's always running in the background, making your intent come through perfectly.

### 🛠️ Skill Creator
**Use for:** Creating new domain-specific skills
**Trigger:** "Create a skill for..."

---

## Commands

### `/ship` 🚀
Runs the full shipping checklist:
1. Run tests
2. Run linter
3. Check git status
4. Create commit with clear message
5. Push to remote
6. Report status

---

## Working Agreements

1. **One thing at a time.** Finish before starting new.
2. **Test changes before committing.**
3. **When uncertain, ask before assuming.**
4. **Check CLAUDE.md for project context.**

---

*This file works with both Cursor IDE and Claude Code CLI.*


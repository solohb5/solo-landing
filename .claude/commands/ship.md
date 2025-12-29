---
name: ship
description: Ship current work - run tests, commit, and push
---

# Ship It 🚀

Execute the shipping checklist:

1. **Run tests**
   ```bash
   npm test
   ```
   If tests fail, stop and report issues.

2. **Run linter**
   ```bash
   npm run lint
   ```
   Fix any issues automatically if possible.

3. **Check for uncommitted changes**
   ```bash
   git status
   ```

4. **Create commit**
   - Generate a clear commit message based on changes
   - Follow conventional commits format
   - Include scope if applicable

5. **Push to remote**
   ```bash
   git push
   ```

6. **Report status**
   - What was shipped
   - Any warnings or notes
   - Next steps if applicable

## If Something Fails

Stop immediately and report:
- What failed
- Why it failed
- How to fix it

Don't push broken code.


# BitPulse Planning Skill

This skill governs the translation of approved feature designs into highly structured, actionable, and incremental implementation plans for **BitPulse**.

It ensures that any coding agent or engineer decomposes tasks logically, adheres to Next.js best practices, keeps styling consistent, and runs verification before completing work.

---

## 1. Announce Phase
Always start the planning process by stating:
> *"I am using the writing-plans skill to create the implementation plan for [Feature Name]."*

---

## 2. Scope & File Structure Mapping
Before writing any tasks, map out the files to be modified or created. Organize them by logical responsibility.

### Recommended Next.js File Layout
- **Actions/API Services**: Keep them server-side inside [lib/coingecko.actions.ts](file:///d:/project/bitpulse/lib/coingecko.actions.ts).
- **Core Business Logic/Constants**: Declare configurations, chart parameters, or constant structures in [constants.ts](file:///d:/project/bitpulse/constants.ts).
- **Shared UI Elements**: Save in [components/ui/](file:///d:/project/bitpulse/components/ui/) or [components/](file:///d:/project/bitpulse/components/).
- **Feature Components**: Save in specialized subfolders, e.g., `components/details/` or `components/home/`.
- **Pages/Routes**: Organize inside `app/` folder using dynamic parameters (e.g., `app/coin/[id]/page.tsx` for coin details).

---

## 3. Plan Layout Structure
Every plan file must be written to [docs/plans/YYYY-MM-DD-<feature-name>-plan.md](file:///d:/project/bitpulse/docs/plans/) and use this template:

```markdown
# [Feature Name] Implementation Plan

## File Structure Changes
- [NEW/MODIFY/DELETE] [file_name](file:///absolute/path/to/file) - Brief description of responsibility.

## Step-by-Step Checklist
- [ ] Task 1: Create types / update `type.d.ts`
- [ ] Task 2: Implement server action or update mock data fetcher
- [ ] Task 3: Build structural layout (UI skeletal / fallback state)
- [ ] Task 4: Implement interactive hook / state logic
- [ ] Task 5: Apply styling (Vanilla CSS / Tailwind variables)
- [ ] Task 6: Verify and check Biome compliance (`npm run check`)
```

---

## 4. Execution Rules

### A. Bite-Sized Granularity
Keep steps small. Each checklist item should represent 2-10 lines of modifications. Do not bundle multiple subsystems (e.g., backend fetches and frontend charting) in a single step.

### B. verification and Linting (Biome)
- BitPulse uses Biome for formatting and linting (`biome.json`).
- You MUST run `npm run check` and `npm run format` after completing implementation tasks to ensure style compliance.
- No code will be merged or marked finished if there are Biome errors.

### C. Testing and Safety
- For dynamic interactions (e.g., watchlists, chart period changes), verify functionality by loading the app locally (`npm run dev`) and using a browser testing agent or manual verification.
- Mock API responses when building features offline or when rate-limited by CoinGecko.
- Ensure proper fallback elements (using React `Suspense` and fallback states similar to those in `components/home/fallback.tsx`).

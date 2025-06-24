# AI Agent Development Standards for Dialect Learning Game

## Project Overview

**Technology Stack:** React 18 + TypeScript + Vite + TailwindCSS v3.4.13 + shadcn/ui + React Router v7
**Project Type:** Interactive dialect learning game with voice recognition, multiplayer features, and progressive web app capabilities
**Architecture Pattern:** Component-based architecture with TDD methodology

## Project Architecture Rules

### Directory Structure Standards
- **Components:** `src/components/` - All React components with subdirectories by function
- **UI Components:** `src/components/ui/` - shadcn/ui base components only
- **Enhanced Components:** Use `EnhancedXXX` naming pattern for custom gaming UI
- **Hooks:** `src/hooks/` - Custom React hooks
- **Services:** `src/services/` - API and external service integrations
- **Tests:** `tests/` with subdirectories: `unit/`, `e2e/`, `navigation/`, `ui/`, `integration/`
- **Styles:** `src/styles/globals.css` - Global CSS variables and Tailwind imports

### Component Architecture Rules
- **MUST use functional components with TypeScript interfaces**
- **MUST export interfaces alongside components**
- **MUST use React.forwardRef for UI components accepting refs**
- **MUST include accessibility attributes (aria-label, role, aria-describedby)**
- **MUST follow shadcn/ui patterns for new UI components**

### Naming Conventions
- **Components:** PascalCase with descriptive names (`GameVoiceIntegration`, `MultiplayerLobby`)
- **Enhanced Components:** `Enhanced` prefix (`EnhancedButton`, `EnhancedCard`)
- **Hooks:** `use` prefix (`useNavigation`, `useGameState`)
- **Test Files:** Match component name with `.test.tsx` suffix
- **Interfaces:** Match component name with `Props` suffix (`LandingPageProps`)

## Navigation Standards

### Router Priority Rules
- **PRIMARY:** Use `AppRouter.tsx` (React Router v7) for all new navigation features
- **LEGACY:** Maintain `Router.tsx` (hash-based) but do not extend
- **NAVIGATION HOOK:** Use `useNavigation.ts` for programmatic navigation
- **ACCESSIBILITY:** All navigation links must include `aria-label` attributes

### Navigation Component Requirements
- **Navigation.tsx:** Main navigation component - update when adding new routes
- **useNavigation.ts:** Navigation hook - update when adding navigation functions
- **Both files must be updated together when adding new navigation features**

## Styling Standards

### TailwindCSS Rules
- **CRITICAL:** Never upgrade TailwindCSS beyond v3.4.13 (v4 breaks shadcn/ui compatibility)
- **Configuration:** Use `tailwind.config.js` (CommonJS format, not ESM)
- **PostCSS:** Use standard v3 syntax in `postcss.config.js`

### Custom CSS Classes (globals.css)
- **Gaming UI:** `gaming-button`, `gaming-card`, `gaming-container`
- **Glass Effects:** `glass-container`, `glass-card`
- **Animations:** `hover-lift`, `floating-animation`, `fade-in-up`, `pulse-glow`
- **Layout:** `glass-container`, `text-gradient`

### Theming Standards
- **Variables:** Use CSS custom properties from `:root` in globals.css
- **Dark Mode:** Use `.dark` class variant with predefined variables
- **Colors:** Use `hsl(var(--primary))` pattern for theme-aware colors
- **Fonts:** `var(--font-display)` for headings, `var(--font-body)` for text

## Testing Requirements

### TDD Approach
- **MANDATORY:** Write tests before implementing features
- **Test Files:** Every component must have corresponding test file
- **Test Structure:** Group tests by component functionality

### Test File Coordination
- **Navigation changes:** Update `tests/navigation/` tests
- **UI changes:** Update `tests/ui/` tests  
- **Component changes:** Update corresponding unit tests
- **Integration features:** Add tests in `tests/integration/`

### Testing Tools
- **Unit Tests:** Vitest + React Testing Library
- **E2E Tests:** Playwright
- **Mocking:** Use `vi.mock()` for external dependencies

## File Coordination Standards

### Multi-File Update Requirements

#### App Component Changes
- **When modifying `App.tsx`:** Check `App.enhanced.tsx` for consistency
- **When modifying `App.enhanced.tsx`:** Ensure features don't conflict with `App.tsx`
- **NEVER modify both simultaneously without explicit coordination**

#### Navigation Changes
- **When modifying `Navigation.tsx`:** Update `useNavigation.ts` with new navigation functions
- **When modifying `useNavigation.ts`:** Update `Navigation.tsx` if new routes are added
- **When adding routes:** Update both `AppRouter.tsx` and navigation tests

#### Landing Page Changes
- **When modifying `LandingPage.tsx`:** Update `tests/navigation/page-navigation.test.tsx`
- **When changing navigation flow:** Update `AppRouter.tsx` route definitions

#### UI Component Changes
- **When adding shadcn/ui components:** Update corresponding test files
- **When modifying enhanced components:** Update gaming theme in globals.css if needed

## Package Management Rules

### Critical Dependencies
- **TailwindCSS:** Must remain at v3.4.13 - NEVER upgrade to v4
- **shadcn/ui:** Install components via `npx shadcn@latest add [component]`
- **React Router:** Use v7 for new features
- **PostCSS:** Use v8.x with Tailwind v3 compatibility

### Installation Commands
- **shadcn/ui components:** `npx shadcn@latest add button card badge`
- **Package updates:** Exclude tailwindcss from bulk updates
- **New dependencies:** Check compatibility with existing TailwindCSS v3 setup

## AI Decision-Making Standards

### Component Choice Priority
1. **Enhanced components** (`EnhancedButton`, `EnhancedCard`) for gaming UI
2. **shadcn/ui base components** for standard UI elements
3. **Custom components** only when enhanced/base components insufficient

### Styling Decision Tree
1. **Gaming UI needed:** Use `gaming-button`, `gaming-card` classes
2. **Glass effect needed:** Use `glass-container`, `glass-card` classes  
3. **Animation needed:** Use existing animation classes from globals.css
4. **Custom styling needed:** Add to globals.css, never use inline styles

### Navigation Decision Tree
1. **New navigation feature:** Use AppRouter.tsx and useNavigation.ts
2. **Existing navigation fix:** Maintain current Router.tsx pattern
3. **Navigation accessibility:** Always include aria-label and role attributes

### Testing Decision Tree
1. **New component:** Create corresponding test file in appropriate tests/ subdirectory
2. **Navigation change:** Update navigation tests
3. **UI change:** Update UI tests
4. **Integration feature:** Add integration test

## Prohibited Actions

### Never Do These Actions
- **NEVER upgrade TailwindCSS to v4 or above**
- **NEVER remove test files without creating replacements**
- **NEVER modify both App.tsx and App.enhanced.tsx in same operation**
- **NEVER add navigation without updating corresponding hooks and tests**
- **NEVER use inline styles instead of CSS classes**
- **NEVER install shadcn/ui components manually - always use CLI**
- **NEVER change navigation patterns without updating accessibility attributes**
- **NEVER add new dependencies without checking TailwindCSS v3 compatibility**

### When in Doubt
- **Check existing patterns** in similar components before creating new ones
- **Verify test coverage** before considering feature complete
- **Confirm accessibility** requirements are met for any UI changes
- **Review globals.css** for existing classes before creating new styles

## Workflow Standards

### Feature Implementation Order
1. **Write tests** for new functionality first (TDD approach)
2. **Implement component** following established patterns  
3. **Add styling** using existing classes or extend globals.css
4. **Update navigation** if new routes are needed
5. **Verify accessibility** and responsive design
6. **Run test suite** to ensure no regressions

### Code Review Checklist
- [ ] TypeScript interfaces defined and exported
- [ ] Accessibility attributes included
- [ ] Corresponding tests created/updated
- [ ] Follows established naming conventions
- [ ] Uses existing CSS classes when possible
- [ ] Navigation updates include hook changes
- [ ] No TailwindCSS v4 dependencies introduced
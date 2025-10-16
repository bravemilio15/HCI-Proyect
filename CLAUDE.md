# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive web-based neural network learning simulator that visualizes programming concepts as neurons. Users click on available neurons to learn concepts, unlocking new ones as they progress. Built with Next.js 15, TypeScript, p5.js for canvas visualization, and Tailwind CSS.

## Development Commands

```bash
# Navigate to project
cd neural-network-app

# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Production server
npm start

# Lint code
npm run lint
```

## Architecture

The project follows **layered architecture with SOLID principles**:

### Directory Structure

```
neural-network-app/
├── app/                    # Next.js App Router
│   ├── api/network/       # API endpoints (GET/POST neuron state)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── NetworkCanvas.tsx  # Main canvas wrapper
│   └── P5Canvas.tsx       # p5.js integration component
├── domain/                # Domain layer (types, interfaces)
│   └── neuron.types.ts    # Core domain types
├── data/                  # Data/Application layer
│   └── mock-data.ts       # Business logic & in-memory state
├── shared/                # Shared utilities
│   ├── constants/         # App constants
│   │   └── network.constants.ts
│   └── utils/
│       └── p5-sketch.ts   # p5.js sketch logic
```

### Layer Responsibilities

- **Presentation** (`app/`, `components/`): React components, UI, user interactions
- **Application** (`data/mock-data.ts`): Business logic, state management, neuron progression rules
- **Domain** (`domain/`): Type definitions, interfaces, contracts
- **Infrastructure** (`app/api/`): API routes for network state persistence
- **Shared** (`shared/`): Constants, utilities, p5.js rendering logic

## Key Architectural Patterns

### 1. State Management
- Network state is managed in-memory via `data/mock-data.ts`
- State is accessed via API routes (`/api/network`)
- Deep cloning used to prevent mutations: `JSON.parse(JSON.stringify(state))`

### 2. Neuron State Machine
Neurons transition through 4 states:
- `blocked` → `available` → `in_progress` → `dominated`
- Progress increments by 25% per click (defined in `PROGRESS_INCREMENT`)
- Unlocking logic: A neuron becomes `available` only when ALL prerequisites are `dominated`

### 3. p5.js Integration
- p5.js runs in instance mode within React
- Canvas logic is separated in `shared/utils/p5-sketch.ts`
- Component wrapper in `components/P5Canvas.tsx` handles React integration
- **Important**: p5.js methods are prefixed with `p.` (e.g., `p.fill()`, `p.ellipse()`)

### 4. API Design
All API responses follow consistent structure:
```typescript
{
  success: boolean,
  data?: any,
  error?: string,
  details?: string
}
```

## Important Technical Details

### Neuron Prerequisites Logic
Located in `data/mock-data.ts:157-164`:
- When a neuron is dominated, it checks `unlocks` array
- For each unlocked neuron, verifies ALL neurons that unlock it are dominated
- Only then transitions from `blocked` → `available`

### Visual States (Constants)
Defined in `shared/constants/network.constants.ts`:
- **Blocked**: Dark gray (#2a2a2a)
- **Available**: Blue with pulsing animation (#1a4d7a)
- **In Progress**: Yellow-green with moon phase visualization (#4a5a2a)
- **Dominated**: Green with glowing halo (#2a5a2a)

### Canvas Dimensions
- Fixed size: 1400x900 (defined in `CANVAS_SIZE`)
- Neuron positions are absolute coordinates in `INITIAL_NETWORK`

## Coding Guidelines (Specific to This Project)

### 1. **NO EMOJIS in Code**
Per `Instrucciones.md`, never use emojis in source code files (.ts, .tsx, .js, etc.). Only in conversational responses.

### 2. Always Propose Before Implementation
Before making changes, present a plan including:
- What you'll change
- Technologies/patterns used
- Files affected
- Complexity level

### 3. TypeScript Strictness
- All domain types are in `domain/neuron.types.ts`
- No `any` types without justification
- Use interfaces for data contracts

### 4. State Immutability
- Never mutate `networkState` directly
- Use deep cloning when reading state: `JSON.parse(JSON.stringify(...))`
- This pattern is critical for React re-renders

### 5. Error Handling
API routes must:
- Validate input (e.g., `route.ts:31-39`)
- Return proper HTTP status codes (400, 404, 500)
- Include error details in response

### 6. Constants Over Magic Numbers
All visual constants (colors, sizes, speeds) are in `network.constants.ts`. Never hardcode values in components.

## Common Tasks

### Adding a New Neuron
1. Add entry to `INITIAL_NETWORK` in `data/mock-data.ts`
2. Include: `id`, `label`, `position {x, y}`, `status`, `unlocks: string[]`
3. Ensure prerequisite chain is correct

### Modifying Progression Logic
1. Edit `updateNeuronProgress()` in `data/mock-data.ts`
2. Adjust `PROGRESS_INCREMENT` constant if needed
3. Update unlocking logic if prerequisites change

### Changing Visual Appearance
1. Modify constants in `shared/constants/network.constants.ts`
2. Update rendering logic in `shared/utils/p5-sketch.ts`
3. Ensure all neuron states have corresponding visual representations

### Adding New API Endpoint
1. Create route in `app/api/<name>/route.ts`
2. Define request/response types in `domain/neuron.types.ts`
3. Implement business logic in `data/mock-data.ts`
4. Follow existing error handling patterns

## Project-Specific Constraints

1. **In-Memory State**: Current implementation uses in-memory storage. State resets on server restart.
2. **Single User**: No multi-user support or session management.
3. **Fixed Network**: The neuron network graph is hardcoded in `INITIAL_NETWORK`.
4. **Client-Side Rendering**: p5.js requires client-side rendering (`'use client'` directive).

## Testing Considerations

Currently no tests are implemented. When adding tests:
- Unit test business logic in `data/mock-data.ts` (especially `updateNeuronProgress`)
- Test API routes for correct status codes and response formats
- Test neuron state transitions
- Mock p5.js for component tests

## Future Improvements (Documented in README)

- JSON-based persistence for state
- Reset button functionality
- Mobile responsive design
- Tooltips with concept descriptions
- Achievement system
- Audio feedback

## Dependencies

- **Next.js 15.5.5**: App Router, API routes
- **React 19.2.0**: UI components
- **TypeScript 5.9.3**: Type safety
- **p5.js 2.0.5**: Canvas visualization
- **Tailwind CSS 3.4.18**: Styling

## Special Notes

- The project follows extensive coding guidelines from `Instrucciones.md` (SOLID, clean code, error handling)
- When proposing changes, consider the complexity level appropriate for the task
- The architecture is designed for scalability despite current in-memory limitations

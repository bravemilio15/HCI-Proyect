
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive web-based neural network learning simulator that visualizes programming concepts as 3D neurons. Users click on available neurons to answer questions and learn concepts, unlocking new ones as they progress. Built with Next.js 15, TypeScript, Three.js (via React Three Fiber) for 3D visualization, and Tailwind CSS.

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
│   ├── NetworkCanvas.tsx  # Main orchestrator component
│   ├── ThreeCanvas.tsx    # Three.js/R3F canvas wrapper
│   ├── NeuronScene.tsx    # 3D scene setup (lighting, camera)
│   ├── Neuron3D.tsx       # Individual 3D neuron spheres
│   ├── ConnectionLine.tsx # Synaptic connections between neurons
│   ├── IntroductionModal.tsx  # First-time neuron click modal
│   ├── QuestionModal.tsx  # Question answering UI
│   └── CompletionModal.tsx    # Neuron completion celebration
├── domain/                # Domain layer (types, interfaces)
│   └── neuron.types.ts    # Core domain types (Neuron, Question, etc.)
├── data/                  # Data/Application layer
│   └── mock-data.ts       # Business logic & in-memory state
└── shared/                # Shared utilities
    └── constants/
        └── network.constants.ts  # Visual constants (colors, sizes)
```

### Layer Responsibilities

- **Presentation** (`app/`, `components/`): React components, UI, modals, user interactions
- **Application** (`data/mock-data.ts`): Business logic, state management, question answering, neuron progression rules
- **Domain** (`domain/`): Type definitions, interfaces, contracts (Neuron, Question, NetworkState)
- **Infrastructure** (`app/api/`): API routes for network state persistence and updates
- **Shared** (`shared/`): Constants for visual styling (colors, sizes, animations)

## Key Architectural Patterns

### 1. State Management
- Network state is managed in-memory via `data/mock-data.ts`
- State is accessed via API routes (`/api/network`)
- Deep cloning used to prevent mutations: `JSON.parse(JSON.stringify(state))`

### 2. Neuron State Machine & Question System
Neurons transition through 4 states based on question answering:
- `blocked` → `available` → `in_progress` → `dominated`
- Each neuron has multiple questions (stored in `questions` array)
- Progress increments by `100 / questions.length` per correct answer
- Users must answer ALL questions correctly to dominate a neuron
- Wrong answers provide feedback but don't increment progress
- Unlocking logic: A neuron becomes `available` only when ALL prerequisites are `dominated`

### 3. Three.js Integration (React Three Fiber)
- Uses `@react-three/fiber` for declarative Three.js in React
- Uses `@react-three/drei` for helpers (OrbitControls, Environment, etc.)
- Uses `@react-three/rapier` for physics simulation (light pulses, particle effects)
- Client-side rendering required: Components use `'use client'` directive
- Dynamic import in `NetworkCanvas.tsx` prevents SSR issues: `dynamic(() => import('./ThreeCanvas'), { ssr: false })`
- **Important**: Three.js canvas must be wrapped with `<Canvas>` from `@react-three/fiber`

### 4. Modal System & User Flow
The application uses a multi-modal approach for user interaction:
1. **IntroductionModal**: Shown on first click of a neuron (when `progress === 0`)
   - Introduces the concept
   - "Start Learning" button transitions to QuestionModal
2. **QuestionModal**: Main learning interface
   - Displays current question from `questions[currentQuestionIndex]`
   - Shows multiple choice options
   - Provides instant feedback (green for correct, red for wrong)
   - Closes automatically on neuron completion
3. **CompletionModal**: Celebration screen when neuron is dominated
   - Shows completed neuron name
   - Lists newly unlocked neurons
   - User can close to continue exploring

Layout changes when QuestionModal is active:
- Canvas moves to left half of screen (50% width)
- QuestionModal appears on right half (50% width)
- Allows simultaneous 3D visualization and question answering

### 5. API Design
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

### Data Flow
1. **Initial Load**: `NetworkCanvas.tsx` fetches network state from `/api/network` (GET)
2. **User Clicks Neuron**: Click event flows from `Neuron3D` → `NeuronScene` → `ThreeCanvas` → `NetworkCanvas`
3. **Modal Display**: `NetworkCanvas` determines which modal to show based on neuron's progress
4. **Answer Submission**: User answers → `QuestionModal` → `NetworkCanvas.handleAnswer()` → POST to `/api/network`
5. **State Update**: API response updates local state → re-renders 3D scene with new colors/states
6. **Unlock Cascade**: Server calculates unlocked neurons in `answerQuestion()` function
7. **Completion**: If neuron dominated, `CompletionModal` shows with unlocked neuron list

### Question Answering Logic
Located in `data/mock-data.ts` (function `answerQuestion`):
- Each neuron has an array of `Question` objects with multiple choice answers
- `currentQuestionIndex` tracks which question the user is on
- Only correct answers increment progress: `progress += 100 / questions.length`
- Wrong answers return feedback but don't change state
- When all questions are answered correctly (`progress >= 100`), neuron becomes `dominated`

### Neuron Prerequisites Logic
Located in `data/mock-data.ts:196-211`:
- When a neuron is dominated, it checks `unlocks` array
- For each unlocked neuron, verifies ALL neurons that unlock it are dominated
- Only then transitions from `blocked` → `available`

### Visual States & 3D Rendering
Defined in `shared/constants/network.constants.ts` and rendered in `components/Neuron3D.tsx`:
- **Blocked**: Dark gray spheres, static
- **Available**: Blue spheres with pulsing animation
- **In Progress**: Shows progress with visual indicators (e.g., partial glow, color transition)
- **Dominated**: Green spheres with glowing particle effects

### 3D Scene Setup
- Neurons are rendered as 3D spheres in world space
- Positions defined as `{ x, y }` in `INITIAL_NETWORK` (data/mock-data.ts)
- Camera and lighting configured in `NeuronScene.tsx`
- Connections between neurons rendered as lines/tubes in `ConnectionLine.tsx`

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

### 7. Client-Side Only Components
Components using Three.js must:
- Include `'use client'` directive at the top
- Be dynamically imported with `{ ssr: false }` when used in server components
- Handle window/browser APIs safely (check if `typeof window !== 'undefined'`)

## Component Responsibilities

### Core Components
- **NetworkCanvas.tsx**: Main orchestrator
  - Manages all state (neurons, modals, loading, errors)
  - Handles API calls (fetch network, submit answers)
  - Controls modal visibility and user flow
  - Implements layout switching (full screen vs split screen)

- **ThreeCanvas.tsx**: 3D Scene wrapper
  - Wraps everything in `<Canvas>` from R3F
  - Sets up camera, controls, and rendering
  - Passes neuron click events to parent

- **NeuronScene.tsx**: Scene composition
  - Renders all neurons and connections
  - Manages lighting and environment
  - Handles 3D scene setup

- **Neuron3D.tsx**: Individual neuron rendering
  - Renders a single neuron as a 3D sphere
  - Applies visual state (color, animations, effects)
  - Handles click detection for interactivity

- **ConnectionLine.tsx**: Synaptic connections
  - Renders lines/tubes between connected neurons
  - May animate when neurons are unlocked

### Modal Components
- **IntroductionModal.tsx**: First-time neuron interaction
- **QuestionModal.tsx**: Question display and answer submission
- **CompletionModal.tsx**: Success celebration and unlock notification

## Common Tasks

### Adding a New Neuron
1. Add entry to `INITIAL_NETWORK` in `data/mock-data.ts`
2. Include: `id`, `label`, `position {x, y}`, `status`, `unlocks: string[]`, `questions: Question[]`, `currentQuestionIndex: 0`
3. Create questions array with `Question` objects (question, options, correctAnswer, explanation)
4. Ensure prerequisite chain is correct by checking `unlocks` arrays

### Modifying Question Answering Logic
1. Edit `answerQuestion()` function in `data/mock-data.ts`
2. Progress calculation: `PROGRESS_INCREMENT = 100 / neuron.questions.length`
3. Update unlocking logic in lines 196-211 if prerequisites change

### Changing Visual Appearance
1. Modify constants in `shared/constants/network.constants.ts`
2. Update 3D rendering logic in `components/Neuron3D.tsx`
3. Adjust animations/effects in `components/NeuronScene.tsx`
4. Ensure all neuron states have corresponding visual representations

### Adding New API Endpoint
1. Create route in `app/api/<name>/route.ts`
2. Define request/response types in `domain/neuron.types.ts`
3. Implement business logic in `data/mock-data.ts`
4. Follow existing error handling patterns

## Project-Specific Constraints

1. **In-Memory State**: Current implementation uses in-memory storage. State resets on server restart.
2. **Single User**: No multi-user support or session management.
3. **Fixed Network**: The neuron network graph is hardcoded in `INITIAL_NETWORK`.
4. **Client-Side Rendering**: Three.js/React Three Fiber requires client-side rendering (`'use client'` directive).
5. **Question System**: Each neuron must have at least one question. Empty questions arrays will cause errors.

## Testing Considerations

Currently no tests are implemented. When adding tests:
- Unit test business logic in `data/mock-data.ts` (especially `answerQuestion` function)
- Test API routes for correct status codes and response formats
- Test neuron state transitions (blocked → available → in_progress → dominated)
- Test question answering logic (correct/incorrect answers, progress calculation)
- Mock Three.js/R3F for component tests (use `@react-three/test-renderer`)

## Future Improvements (Documented in README)

- JSON-based persistence for state
- Reset button functionality
- Mobile responsive design
- Tooltips with concept descriptions
- Achievement system
- Audio feedback

## Dependencies

- **Next.js 15.5.5**: App Router, API routes, SSR/CSR handling
- **React 19.2.0**: UI components
- **TypeScript 5.9.3**: Type safety
- **Three.js 0.180.0**: 3D graphics library
- **@react-three/fiber 9.4.0**: React renderer for Three.js
- **@react-three/drei 10.7.6**: Useful helpers for R3F (OrbitControls, Environment, etc.)
- **@react-three/rapier 2.1.0**: Physics engine for 3D effects
- **Tailwind CSS 3.4.18**: Styling for UI components and modals

## Special Notes

- The project follows extensive coding guidelines from `Instrucciones.md` (SOLID, clean code, error handling)
- When proposing changes, consider the complexity level appropriate for the task
- The architecture is designed for scalability despite current in-memory limitations

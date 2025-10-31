# Implementation Plan: Tile Widget Dashboard Component

**Branch**: `003-tile-widget` | **Date**: 2025-10-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-tile-widget/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a new dashboard item type `"tiles"` that displays configurable colored tiles showing numeric KPI values from SQL queries. Each tile is clickable and filters child grids via `${tile_name}` template variable substitution. Tiles must be the first dashboard item when present, and only one tile widget is allowed per template. Implementation extends existing dashboard rendering pipeline and ConfigValidator without requiring new dependencies.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES6+) in browser environment  
**Primary Dependencies**: jQuery 3.7.1 (DOM manipulation), Tabulator (grids), SQLite WASM (sqlean.js), Toastify (notifications)  
**Storage**: Client-side SQLite WASM databases loaded via HTTP  
**Testing**: Manual testing with example `index.json` configurations and test SQLite databases  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) supporting ES6+ and WASM  
**Project Type**: Single-page web application - static HTML/CSS/JS  
**Performance Goals**: Render 10+ tiles in <500ms; tile click triggers child grid updates in <500ms  
**Constraints**: Zero-build architecture (no transpilers/bundlers); all code runs directly in browser; WASM-only database access  
**Scale/Scope**: Dashboard templates with 1 tile widget containing 1-20 tiles; child grids with 1000+ rows each

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Zero-Build Static Architecture** (Principle I): No build tools, transpilers, or bundlers; vanilla HTML/CSS/JS only; no package.json; direct deployment
  - *Compliance*: Feature adds vanilla JavaScript functions to `index.html`; no build process required
  - *Phase 1 Verification*: ✅ All rendering logic uses vanilla JS and jQuery; no transpilation needed
- [x] **Vendored Dependencies** (Principle II): All libraries committed to /js directory with version tracking; manual updates only
  - *Compliance*: No new dependencies required; uses existing jQuery, Tabulator, SQLite WASM
  - *Phase 1 Verification*: ✅ Confirmed zero new dependencies; all functionality uses existing libraries
- [x] **Configuration-Driven Behavior** (Principle III, NON-NEGOTIABLE): Changes use index.json schema; configValidator.js updated; validation errors halt with clear messages
  - *Compliance*: Adds new `type: "tiles"` to schema; extends ConfigValidator with tile-specific validation rules
  - *Phase 1 Verification*: ✅ Seven validation rules defined in contracts/validation-rules.md; all configuration-driven
- [x] **HTTP-Only Data Loading** (Principle IV): Databases and configs fetched via HTTP(S); ?url= parameter required; cache-busting added; CORS documented if needed
  - *Compliance*: Tiles use existing HTTP fetch pattern; no changes to data loading mechanism
  - *Phase 1 Verification*: ✅ Tile queries execute against existing in-memory WASM database; no new HTTP patterns
- [x] **Client-Side SQLite via WASM** (Principle V): Queries execute client-side using sqlean.js/wasm; no server-side database or API
  - *Compliance*: Tile queries execute via existing `db.exec()` pattern; purely client-side
  - *Phase 1 Verification*: ✅ All tile queries use `db.exec({sql, rowMode: "object", resultRows})` pattern
- [x] **Technology Stack**: Only approved libraries used (jQuery, Tabulator, Chart.js, SQLite WASM, Routie, Mermaid, Marked, Toastify, W3.CSS); no prohibited tools
  - *Compliance*: Uses only existing approved libraries; no new dependencies
  - *Phase 1 Verification*: ✅ jQuery for DOM, SQLite WASM for queries, Toastify for errors; all approved
- [x] **Configuration Schema Changes**: Follow semver; breaking changes have migration guide; backward compatibility period provided
  - *Compliance*: MINOR version change (adds optional new type); backward compatible with existing grid/chart-only dashboards
  - *Phase 1 Verification*: ✅ Fully backward compatible; tile widget is optional additive feature

**Constitutional Compliance**: ✅ FULL COMPLIANCE - No violations or exceptions needed  
**Phase 1 Re-Check**: ✅ PASSED - All design decisions maintain constitutional compliance

## Project Structure

### Documentation (this feature)

```text
specs/003-tile-widget/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── validation-rules.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/workspaces/sqlite-browser-dashboard/
├── index.html                    # Main application - ADD tile rendering functions
├── js/
│   ├── configValidator.js        # MODIFY: Add tile widget validation rules
│   ├── jquery-3.7.1.min.js       # Existing - no changes
│   ├── tabulator.min.js          # Existing - no changes
│   ├── sqlean.js                 # Existing - no changes
│   ├── toastify.js               # Existing - no changes
│   └── ws.css                    # Existing - may add tile-specific styles inline
├── docs/
│   └── examples/
│       └── tiles-example/        # NEW: Example configuration for tiles
│           ├── index.json        # Example tile widget configuration
│           └── sample.db         # Sample SQLite database for testing
└── readme.md                     # UPDATE: Document tile widget configuration
```

**Structure Decision**: Single-project web application structure maintained. All changes confined to `index.html` (add tile rendering logic), `js/configValidator.js` (add validation), and documentation/examples. No new JavaScript files needed - follows existing pattern of all application logic in `index.html`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations - this section intentionally left empty.

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE

**Artifacts Generated**:
- `research.md` - 7 research questions resolved with design decisions

**Key Decisions**:
1. Tile rendering pattern: Extend `queryAndBuildVisualization()` function
2. Query execution: Parallel execution via `Promise.all()`
3. Click interaction: Global `window.tile_widget_state` variable
4. Color specification: Any CSS color value supported
5. Numeric formatting: `Number.toLocaleString()` with optional abbreviation
6. Positioning enforcement: ConfigValidator validation rules
7. Text contrast: WCAG-compliant luminance calculation

**Status**: All technical unknowns resolved. No open questions blocking implementation.

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Artifacts Generated**:
- `data-model.md` - 4 entities defined with relationships
- `contracts/validation-rules.md` - 7 validation rules (5 errors, 2 warnings)
- `quickstart.md` - Complete user guide with examples
- `.github/copilot-instructions.md` - Updated agent context

**Key Deliverables**:

1. **Data Model**:
   - Tile Widget Dashboard Item (configuration entity)
   - Tile Configuration (individual tile spec)
   - Tile State (runtime state)
   - Global Tile Context (interaction state)

2. **Validation Rules**:
   - TILE-001: Single tile widget per template (error)
   - TILE-002: Tile widget must be first item (error)
   - TILE-003: Tiles array not empty (error)
   - TILE-004: Tile name required (error)
   - TILE-005: Tile query required (error)
   - TILE-006: Duplicate tile names (warning)
   - TILE-007: Invalid color format (warning)

3. **User Documentation**:
   - 5-step quickstart guide
   - 3 common usage patterns
   - Troubleshooting section
   - Complete working example

**Constitution Re-Check**: ✅ PASSED - All design decisions maintain full constitutional compliance

**Status**: Design complete. Ready for Phase 2 (task breakdown).

---

## Next Steps

Run `/speckit.tasks` to generate implementation tasks from this plan.

**Expected Tasks**:
1. Extend ConfigValidator with 7 tile validation rules
2. Add tile rendering function to index.html
3. Implement parallel query execution for tiles
4. Add tile click handlers and template substitution
5. Implement contrast-aware text color calculation
6. Create example tile configuration in docs/examples
7. Update README with tile widget documentation

**Estimated Scope**: 3-5 hours implementation + 1-2 hours testing

---

## References

- **Feature Spec**: [spec.md](spec.md)
- **Research**: [research.md](research.md)
- **Data Model**: [data-model.md](data-model.md)
- **Validation Contract**: [contracts/validation-rules.md](contracts/validation-rules.md)
- **User Guide**: [quickstart.md](quickstart.md)
- **Constitution**: `../.specify/memory/constitution.md`

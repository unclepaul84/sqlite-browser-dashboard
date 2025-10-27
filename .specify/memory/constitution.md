<!--
Sync Impact Report

Version change: none → 1.0.0
Modified principles: (new) All principles created
Added sections: Core Principles, Operational Constraints, Development Workflow, Governance
Removed sections: none
Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section updated
  ⚠ .specify/templates/spec-template.md - pending review
  ⚠ .specify/templates/tasks-template.md - pending review
  ⚠ .specify/templates/checklist-template.md - pending review
  ⚠ .specify/templates/agent-file-template.md - pending review
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown; maintainers should fill with actual date
-->

<!--
Sync Impact Report

Version change: none → 1.0.0
Modified principles: (new) All principles created based on existing implementation
Added sections: Core Principles, Technology Stack, Development Workflow, Governance
Removed sections: none
Templates requiring updates:
  ⚠ .specify/templates/plan-template.md - Constitution Check needs alignment
  ⚠ .specify/templates/spec-template.md - pending review
  ⚠ .specify/templates/tasks-template.md - pending review
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Maintainers should set actual adoption date
-->

# SQLite Browser Dashboard Constitution

## Core Principles

### I. Zero-Build Static Architecture

All code MUST run directly in browsers without build tools, transpilers, or bundlers. The repository contains only HTML, CSS, and vanilla JavaScript. No package.json, webpack, npm scripts, or compilation steps exist. Deployment is direct file copy to any static host.

**Rationale**: Eliminates build complexity, ensures GitHub Pages compatibility, guarantees long-term reproducibility, and removes Node.js dependency chain vulnerabilities.

### II. Vendored Dependencies

All third-party libraries MUST be committed as complete, versioned files in the `/js` directory. Current dependencies: jQuery 3.7.1, Tabulator (grid), Chart.js (charts), SQLite WASM (sqlean), Routie (routing), Mermaid (diagrams), Marked (markdown), Toastify (notifications), W3.CSS (styles). Dependency updates MUST be manual, deliberate commits with version tracking in README.

**Rationale**: Ensures reproducibility, eliminates CDN dependencies and SPOF, works offline, and provides audit trail for security/compatibility.

### III. Configuration-Driven Behavior (NON-NEGOTIABLE)

Application behavior MUST be controlled through declarative `index.json` configuration files validated at runtime by `configValidator.js`. The schema defines: datasets (title, db_url, dashboard_items_tempate), dashboard_templates (name, documentation_url, dashboard_items). Dashboard items specify: title, type (grid/chart), query (SQL), parent (for nested views), templated (boolean), grid_row_menus, chartType, options. Configuration errors MUST halt execution with clear toast messages listing all validation failures.

**Rationale**: Separates data from code, enables non-developers to create dashboards, supports multiple datasets without code changes, enforces contracts.

### IV. HTTP-Only Data Loading

SQLite databases and configuration files MUST be fetchable via HTTP(S) using standard fetch API. Query parameters MUST include cache-busting (`?date=${new Date()}`). The `?url=` query parameter specifies the base path for `index.json`. File:// protocol is not supported. CORS must be configured on remote hosts.

**Rationale**: Aligns with static hosting model, enables GitHub Pages cross-repo data loading, avoids browser file:// restrictions.

### V. Client-Side SQLite via WASM

Database queries MUST execute client-side using SQLite WASM (sqlean.js/wasm). Databases are loaded into memory via `loadSqliteFromArrayBuffer()`. No server-side database or API layer exists. Query execution uses `db.exec({sql, rowMode: "object", resultRows})`.

**Rationale**: Eliminates backend servers, enables offline operation after initial load, provides full SQL query capability, scales to thousands of rows.

## Technology Stack

**Fixed Stack** (changes require constitutional amendment):
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- jQuery 3.7.1 (DOM manipulation, AJAX)
- Tabulator (interactive grids with filter/sort/export)
- Chart.js (bar, line, pie, doughnut visualizations)
- SQLite WASM (sqlean - client-side database)
- Routie (client-side routing via hash)
- Mermaid (diagram rendering in cells)
- Marked (markdown rendering in cells)
- Toastify (error/success notifications)
- W3.CSS (base styles)

**Prohibited**:
- Build tools (webpack, vite, parcel, rollup)
- Transpilers (babel, typescript compiler)
- Package managers (npm, yarn, pnpm for runtime dependencies)
- Server-side components (Node.js APIs, PHP, Python backends)
- Database servers (PostgreSQL, MySQL, remote SQLite)

## Development Workflow

### Feature Development

1. **Specification**: Create spec using `.specify/templates/spec-template.md` defining user scenarios, configuration schema changes, and acceptance criteria
2. **Implementation**: Modify `index.html`, add/update JS files, update `configValidator.js` for schema changes
3. **Configuration Update**: Document new configuration fields in README with examples
4. **Testing**: Validate with example `index.json` and test SQLite database; verify error handling
5. **Documentation**: Update README features list, configuration fields section, and usage examples

### Configuration Schema Changes

Configuration schema follows semantic versioning:
- **MAJOR**: Remove fields, change field types, breaking query syntax changes
- **MINOR**: Add optional fields, new visualization types, new features
- **PATCH**: Documentation, validation messages, bug fixes

Breaking changes MUST include:
- Migration guide in README
- Backward compatibility period (deprecation warnings before removal)
- Example configurations showing old → new

### Manual Dependency Updates

Updating vendored libraries:
1. Download new version from official source
2. Verify integrity (hash check recommended)
3. Replace file in `/js` directory
4. Update version number in README Technology Stack section
5. Test all features (grids, charts, queries, markdown, mermaid)
6. Commit with message: `deps: update [library] to v[X.Y.Z]`

## Governance

### Amendment Process

Constitutional amendments MUST be submitted via pull request including:
- Clear rationale for change
- Impact assessment (breaking vs. non-breaking)
- Migration plan for breaking changes
- Updated plan-template.md Constitution Check if principles change

**Approval Requirements**:
- Material changes (new/removed principles, stack changes): 2 maintainer approvals
- Editorial fixes (typos, clarifications): 1 maintainer approval

### Versioning Semantics

- **MAJOR**: Incompatible principle removal/redefinition, technology stack changes
- **MINOR**: New principles, expanded guidance, new constraints
- **PATCH**: Clarifications, formatting, typo fixes

### Compliance Enforcement

All feature implementations MUST verify constitutional compliance before merging:
- No build tools introduced
- Dependencies properly vendored
- Configuration changes validated
- Documentation updated
- HTTP-only data access maintained
- Client-side execution preserved

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-10-27

## Operational Constraints

1. **No Build Pipeline**: All HTML, CSS, and JavaScript MUST run directly in browsers without preprocessing
2. **Vendored Dependencies**: All libraries (jQuery, Tabulator, Chart.js, SQLite WASM, etc.) MUST be committed to the repository with version tracking
3. **HTTP-Only Data Access**: SQLite databases and configuration files MUST be fetchable via HTTP(S); file:// protocol is not supported
4. **CORS-Aware Design**: Documentation MUST include CORS configuration guidance for cross-origin data hosting
5. **Progressive Enhancement**: Core grid and query features MUST work before advanced features (charts, Mermaid) load

## Development Workflow

1. **Feature Specification**: Use `.specify/templates/spec-template.md` to define user scenarios and acceptance criteria
2. **Implementation Planning**: Use `.specify/templates/plan-template.md` to capture technical approach and verify constitutional compliance
3. **Constitution Check**: All plans MUST verify compliance with principles before implementation (see plan template)
4. **Testing**: Features SHOULD include test scenarios that can be validated against example datasets
5. **Documentation**: README updates MUST accompany all user-facing features with configuration examples

## Governance

This constitution governs all development on the SQLite Browser Dashboard project.

**Amendment Process**:
- Amendments MUST be proposed via pull request with clear rationale
- Amendments require approval from at least one repository maintainer
- Material changes (new/removed principles) require documented impact assessment
- Editorial fixes (typos, clarifications) can be merged with single approval

**Version Semantics**:
- **MAJOR**: Backward-incompatible principle changes or removals
- **MINOR**: New principles or substantive guidance additions  
- **PATCH**: Clarifications, formatting, non-semantic edits

**Compliance Enforcement**:
- All feature branches MUST pass Constitution Check in implementation plan
- Pull requests that violate principles MUST justify exceptions or be rejected
- Constitution violations found in production MUST be tracked and remediated

**Version**: 1.0.0 | **Ratified**:2025-10-27 | **Last Amended**: 2025-10-27

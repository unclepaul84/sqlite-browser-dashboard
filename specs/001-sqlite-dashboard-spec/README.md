# Specification: SQLite Browser Dashboard

**Branch**: `001-sqlite-dashboard-spec`  
**Created**: 2025-10-31  
**Type**: Documentation (Existing Implementation)  
**Status**: Complete

## Overview

This specification documents the existing SQLite Browser Dashboard functionality by analyzing the implemented codebase. It serves as authoritative documentation for the current feature set, configuration schema, and deployment patterns.

## Document Structure

### 📋 [spec.md](./spec.md)
**Purpose**: Complete feature specification with user stories and requirements

**Contents**:
- 12 prioritized user stories (P1-P3)
- 35 functional requirements
- 12 measurable success criteria
- Edge case handling
- Key entities and relationships

**Use When**: Understanding feature scope, acceptance criteria, user workflows

---

### 🗄️ [data-model.md](./data-model.md)
**Purpose**: Detailed documentation of the `index.json` configuration schema

**Contents**:
- Configuration root object structure
- Dataset entity schema
- Dashboard Template entity schema
- Dashboard Item entity schema (grid and chart variants)
- Grid Row Menu entity schema
- Template variable substitution rules
- Special column naming conventions (_md, _mermaid)
- Validation error reference
- Complete configuration examples

**Use When**: Creating/editing index.json files, understanding validation rules

---

### 🚀 [quickstart.md](./quickstart.md)
**Purpose**: Step-by-step deployment and usage guide

**Contents**:
- 5-minute quick start tutorial
- Deployment scenarios (GitHub Pages, AWS S3, local dev)
- Configuration examples (grids, charts, drill-downs, markdown)
- Testing checklist
- Common errors and solutions
- Performance tips
- Security considerations
- Troubleshooting guide

**Use When**: First-time setup, deployment, troubleshooting issues

---

### 📜 [contracts/configuration-schema.md](./contracts/configuration-schema.md)
**Purpose**: Formal JSON schema contract and validation rules

**Contents**:
- Complete JSON Schema (draft-07) definition
- Runtime validation rules beyond JSON schema
- Breaking changes policy (semver)
- Error code reference (VAL-001 through VAL-100)
- Request/response flow examples
- Test cases (valid and invalid configs)
- Compatibility matrix

**Use When**: Building config validators, understanding validation logic, API integration

---

## Quick Reference

### Minimum Viable Configuration

```json
{
  "datasets": [
    {
      "title": "My Database",
      "db_url": "database.sqlite",
      "dashboard_items_tempate": "default"
    }
  ],
  "dashboard_templates": [
    {
      "name": "default",
      "dashboard_items": [
        {
          "title": "My Grid",
          "query": "SELECT * FROM my_table"
        }
      ]
    }
  ]
}
```

### Key Technologies

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Grid**: Tabulator.js
- **Charts**: Chart.js (bar, line, pie, doughnut)
- **Database**: SQLite WASM (sqlean.js)
- **Routing**: Routie (hash-based)
- **Markdown**: Marked.js
- **Diagrams**: Mermaid.js
- **Notifications**: Toastify
- **Styles**: W3.CSS

### URL Structure

```
https://your-dashboard.com/index.html?url=https://your-data.com#dataset/DatasetName
                                            │                            │
                                            └─ config location           └─ hash routing
```

### Deployment Checklist

- [ ] SQLite database(s) created and tested
- [ ] `index.json` created and validated
- [ ] Files hosted via HTTP(S) (not file://)
- [ ] CORS configured if cross-origin
- [ ] Dashboard URL includes `?url=` parameter
- [ ] Browser console checked for errors
- [ ] Example queries tested via Custom Query

## User Story Priority Map

### P1 (Critical - MVP)
1. Configure and Load Dashboard from JSON
2. Load SQLite Database and Execute Queries
3. Interactive Data Grids with Filtering and Sorting

### P2 (Important)
4. Export Grid Data
5. Data Visualization with Charts
6. Parent-Child Drill-Down Grids
12. Hash-Based Dataset Routing

### P3 (Nice to Have)
7. Markdown and Mermaid Rendering in Cells
8. Context Menu Actions on Grid Rows
9. Custom SQL Query Interface
10. Database Schema Viewer with ER Diagram
11. Documentation Sidebar from Markdown

## Configuration Schema at a Glance

```
index.json
├── datasets[]
│   ├── title (string, required)
│   ├── db_url (string, required)
│   └── dashboard_items_tempate (string, required)
└── dashboard_templates[]
    ├── name (string, required, unique)
    ├── documentation_url (string, optional)
    └── dashboard_items[]
        ├── title (string, required, unique per template)
        ├── query (string, required, SQL)
        ├── type (string, "grid" | "chart", default: "grid")
        ├── parent (string, optional, references another item)
        ├── templated (boolean, optional)
        ├── grid_row_menus[] (optional)
        │   ├── label (string, required)
        │   └── url (string, required, supports ${var})
        ├── chartType (string, required if type="chart")
        │   └── "bar" | "line" | "pie" | "doughnut"
        └── options (object, required if type="chart")
            ├── xField (string, required)
            ├── yField (string, required)
            └── title (string, optional)
```

## Success Metrics

From spec.md, the dashboard achieves:

- ✅ **Configuration-Driven**: 100% configurable via JSON (no code changes)
- ✅ **Performance**: Handles 10,000+ rows without lag
- ✅ **Offline Capable**: Works offline after initial load (vendored dependencies)
- ✅ **Static Hosting**: Deployable to any static host (GitHub Pages, S3, etc.)
- ✅ **Client-Side**: No server-side components required
- ✅ **Interactive**: Real-time filtering, sorting, export
- ✅ **Visual**: Charts, markdown, diagrams in-grid
- ✅ **Extensible**: Parent-child drill-downs, custom context menus

## Implementation Notes

This specification was created by analyzing the existing codebase:

1. **User Stories**: Extracted from `index.html` functionality (query execution, grid rendering, routing, etc.)
2. **Requirements**: Derived from `configValidator.js` schema validation
3. **Data Model**: Reverse-engineered from `ConfigValidator.validateConfig()` logic
4. **Contracts**: Formalized based on validation rules and error messages
5. **Quickstart**: Synthesized from README.md and deployment patterns

## Next Steps

### For Users
1. Read [quickstart.md](./quickstart.md) for setup instructions
2. Review [data-model.md](./data-model.md) for configuration examples
3. Create your `index.json` configuration
4. Deploy and test

### For Developers
1. Review [spec.md](./spec.md) for complete feature requirements
2. Check [contracts/configuration-schema.md](./contracts/configuration-schema.md) for validation rules
3. Reference [data-model.md](./data-model.md) for entity relationships
4. Use specification as basis for new features or refactoring

### For Contributors
- All new features should add corresponding user stories to spec.md
- Configuration schema changes must update contracts/configuration-schema.md
- Breaking changes require migration guide in quickstart.md
- Follow constitutional principles in `.specify/memory/constitution.md`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-31 | Initial specification created from existing implementation |

## Related Documents

- [Constitution](../../.specify/memory/constitution.md) - Project governance and principles
- [README.md](../../readme.md) - User-facing documentation
- [ConfigValidator.js](../../js/configValidator.js) - Schema validation implementation

---

**Maintainer**: Extracted from existing codebase  
**Last Updated**: 2025-10-31

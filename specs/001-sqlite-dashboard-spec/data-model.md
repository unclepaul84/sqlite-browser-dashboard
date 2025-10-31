# Data Model: SQLite Browser Dashboard Configuration

**Feature**: 001-sqlite-dashboard-spec  
**Created**: 2025-10-31  
**Purpose**: Document the `index.json` configuration schema and validation rules

## Overview

The SQLite Browser Dashboard is entirely configuration-driven through an `index.json` file that defines datasets and their visualization templates. This document extracts the schema from the existing `ConfigValidator.js` implementation.

## Configuration Root Object

```json
{
  "datasets": [ /* Dataset[] - required */ ],
  "dashboard_templates": [ /* DashboardTemplate[] - required */ ]
}
```

### Validation Rules

- `datasets` MUST be an array (not null/undefined)
- `dashboard_templates` MUST be an array (not null/undefined)
- All template names in `dashboard_templates` MUST be unique
- All dataset references to `dashboard_items_tempate` MUST match an existing template name

---

## Dataset Entity

Represents a SQLite database and its associated visualization template.

### Schema

```json
{
  "title": "string - required",
  "db_url": "string - required", 
  "dashboard_items_tempate": "string - required"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Display name shown in dataset dropdown |
| `db_url` | string | Yes | URL or relative path to SQLite database file |
| `dashboard_items_tempate` | string | Yes | Name of dashboard template to use (must exist in dashboard_templates array) |

### Validation Rules

- `title` MUST be non-empty string
- `db_url` MUST be non-empty string
- `dashboard_items_tempate` MUST be non-empty string
- `dashboard_items_tempate` value MUST match exactly one template name in dashboard_templates array

### URL Resolution

- If `db_url` contains `/` → treated as absolute/full URL
- If `db_url` does NOT contain `/` → resolved relative to config_source_path (the `?url=` parameter value)

### Example

```json
{
  "title": "Sales Data 2024",
  "db_url": "databases/sales_2024.sqlite",
  "dashboard_items_tempate": "sales_dashboard"
}
```

---

## Dashboard Template Entity

Defines a named collection of dashboard items (grids/charts) and optional documentation.

### Schema

```json
{
  "name": "string - required",
  "documentation_url": "string - optional",
  "dashboard_items": [ /* DashboardItem[] - required */ ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique identifier for this template |
| `documentation_url` | string | No | URL or relative path to markdown documentation file |
| `dashboard_items` | array | Yes | Array of DashboardItem objects defining visualizations |

### Validation Rules

- `name` MUST be non-empty string
- `name` MUST be unique across all templates
- `dashboard_items` MUST be an array
- All dashboard item `title` values within a template MUST be unique
- If dashboard item has `parent` field, parent item title MUST exist in same template

### URL Resolution

- If `documentation_url` contains `/` → treated as absolute/full URL
- If `documentation_url` does NOT contain `/` → resolved relative to config_source_path

### Example

```json
{
  "name": "sales_dashboard",
  "documentation_url": "docs/sales_guide.md",
  "dashboard_items": [ /* ... */ ]
}
```

---

## Dashboard Item Entity

Defines a single visualization (grid or chart) within a dashboard template.

### Base Schema

```json
{
  "title": "string - required",
  "query": "string - required",
  "type": "string - optional (default: 'grid')",
  "parent": "string - optional",
  "templated": "boolean - optional",
  "grid_row_menus": [ /* GridRowMenu[] - optional */ ]
}
```

### Common Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Display name for the visualization |
| `query` | string | Yes | SQL query to execute (supports `${variable}` substitution if templated) |
| `type` | string | No | Visualization type: "grid" or "chart" (default: "grid") |
| `parent` | string | No | Title of parent dashboard item (for drill-down functionality) |
| `templated` | boolean | No | If true, item is hidden until parent row clicked; query/title support `${var}` substitution |
| `grid_row_menus` | array | No | Array of GridRowMenu objects (right-click menu options) |

### Validation Rules

- `title` MUST be non-empty string
- `title` MUST be unique within the dashboard template
- `query` MUST be non-empty string
- `type` if specified MUST be "grid" or "chart"
- If `parent` specified, value MUST match title of another dashboard item in same template
- If `grid_row_menus` specified, MUST be array of valid GridRowMenu objects

---

## Chart-Specific Fields

When `type: "chart"`, additional fields are required:

### Schema Extension

```json
{
  "chartType": "string - required",
  "options": {
    "xField": "string - required",
    "yField": "string - required",
    "title": "string - optional"
  }
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chartType` | string | Yes | Chart.js type: "bar", "line", "pie", or "doughnut" |
| `options` | object | Yes | Chart configuration object |
| `options.xField` | string | Yes | Query result column name for X-axis labels |
| `options.yField` | string | Yes | Query result column name for Y-axis values |
| `options.title` | string | No | Dataset label for chart legend |

### Validation Rules

- `chartType` MUST be one of: "bar", "line", "doughnut", "pie"
- `options` object MUST be present
- `options.xField` MUST be non-empty string
- `options.yField` MUST be non-empty string

### Example

```json
{
  "title": "Sales by Category",
  "type": "chart",
  "chartType": "bar",
  "query": "SELECT category, SUM(amount) as total FROM sales GROUP BY category",
  "options": {
    "xField": "category",
    "yField": "total",
    "title": "Total Sales"
  }
}
```

---

## Grid Row Menu Entity

Defines a right-click context menu item for grid rows.

### Schema

```json
{
  "label": "string - required",
  "url": "string - required"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Menu item display text |
| `url` | string | Yes | URL template (supports `${column_name}` substitution from row data) |

### Validation Rules

- `label` MUST be non-empty string
- `url` MUST be non-empty string

### Template Variable Substitution

- URL can contain `${column_name}` placeholders
- When menu item clicked, values substituted from clicked row's data
- Opens in new browser tab via `window.open(url, "_blank")`

### Example

```json
{
  "label": "View Customer Details",
  "url": "https://crm.example.com/customer/${customer_id}"
}
```

---

## Template Variable Substitution

Used in child dashboard items and grid row menus.

### Syntax

```
${column_name}
```

### Behavior

- Regex pattern: `/\${(.*?)}/g`
- Replaces `${key}` with value from row data object
- If key not found in row data, replaces with empty string
- Works in both `title` and `query` fields when `templated: true`
- Works in `grid_row_menus` URL fields

### Examples

**Query Template**:
```sql
SELECT * FROM orders WHERE customer_id = ${customer_id} AND year = ${order_year}
```

**Title Template**:
```
Orders for Customer ${customer_name} (${customer_id})
```

**URL Template**:
```
https://admin.example.com/order/${order_id}/edit
```

---

## Special Column Naming Conventions

### Markdown Rendering

Columns ending with `_md` automatically render as markdown:

```sql
SELECT description_md, notes_md FROM products
```

- Values parsed by Marked.js
- Supports standard markdown: bold, italic, links, lists, etc.
- HTML output displayed in grid cell

### Mermaid Diagram Rendering

Columns ending with `_mermaid` automatically render as Mermaid diagrams:

```sql
SELECT workflow_diagram_mermaid FROM processes
```

- Values wrapped in `<span class="mermaidCell">`
- Mermaid.js runs after grid render
- Supports all Mermaid diagram types (flowchart, sequence, ER, etc.)

---

## Complete Configuration Example

```json
{
  "datasets": [
    {
      "title": "Customer Analytics",
      "db_url": "data/customers.sqlite",
      "dashboard_items_tempate": "customer_dashboard"
    }
  ],
  "dashboard_templates": [
    {
      "name": "customer_dashboard",
      "documentation_url": "docs/customer_guide.md",
      "dashboard_items": [
        {
          "title": "All Customers",
          "type": "grid",
          "query": "SELECT id, name, email, total_orders FROM customers ORDER BY total_orders DESC",
          "grid_row_menus": [
            {
              "label": "View in CRM",
              "url": "https://crm.example.com/customer/${id}"
            }
          ]
        },
        {
          "title": "Customer Orders for ${name}",
          "type": "grid",
          "query": "SELECT order_id, date, total FROM orders WHERE customer_id = ${id}",
          "parent": "All Customers",
          "templated": true
        },
        {
          "title": "Orders by Month",
          "type": "chart",
          "chartType": "bar",
          "query": "SELECT strftime('%Y-%m', date) as month, COUNT(*) as count FROM orders GROUP BY month",
          "options": {
            "xField": "month",
            "yField": "count",
            "title": "Monthly Orders"
          }
        }
      ]
    }
  ]
}
```

---

## Validation Error Messages

Error messages generated by ConfigValidator.js:

### Top-Level Errors
- `"Missing or invalid 'datasets' array"`
- `"Missing or invalid 'dashboard_templates' array"`

### Dataset Errors
- `"Dataset[{idx}]: Missing required 'title' field"`
- `"Dataset[{idx}]: Missing required 'db_url' field"`
- `"Dataset[{idx}]: Missing required 'dashboard_items_tempate' field"`
- `"Dataset[{idx}]: Referenced template '{name}' not found"`

### Template Errors
- `"Template[{idx}]: Missing required 'name' field"`
- `"Template[{idx}]: Duplicate template name '{name}'"`
- `"Template[{idx}]: Missing or invalid 'dashboard_items' array"`

### Dashboard Item Errors
- `"Template[{idx}].items[{itemIdx}]: Missing required 'title' field"`
- `"Template[{idx}].items[{itemIdx}]: Duplicate item title '{title}'"`
- `"Template[{idx}].items[{itemIdx}]: Missing required 'query' field"`
- `"Template[{idx}].items[{itemIdx}]: Invalid type '{type}'. Must be 'grid' or 'chart'"`
- `"Template[{idx}].items[{itemIdx}]: Chart type required for chart visualization"`
- `"Template[{idx}].items[{itemIdx}]: Invalid chart type '{chartType}'"`
- `"Template[{idx}].items[{itemIdx}]: Chart requires options configuration"`
- `"Template[{idx}].items[{itemIdx}]: Chart requires options.xField"`
- `"Template[{idx}].items[{itemIdx}]: Chart requires options.yField"`
- `"Template[{idx}].items[{itemIdx}]: grid_row_menus must be an array"`
- `"Template[{idx}].items[{itemIdx}].menus[{menuIdx}]: Missing required 'label' field"`
- `"Template[{idx}].items[{itemIdx}].menus[{menuIdx}]: Missing required 'url' field"`
- `"Template[{idx}].items[{itemIdx}]: Parent item '{parent}' not found"`

---

## Runtime Validation Flow

1. Fetch `index.json` from `${config_source_path}/index.json?date=${new Date()}`
2. Parse JSON
3. Call `ConfigValidator.validateConfig(json)`
4. If validation fails (`!isValid`):
   - Display all errors via `showErrorToast()` for each error
   - Halt execution (return early)
5. Additional runtime check: verify unique dashboard item titles
   - If duplicates found, show toast and halt
6. If validation passes: populate dataset dropdown and initialize routing

---

## Implementation Notes

- **Validation Timing**: Occurs immediately after JSON parse, before any rendering
- **Error Display**: All validation errors shown simultaneously via toast notifications (duration: 3000ms, red background)
- **Fail-Fast**: Any validation failure prevents dashboard initialization
- **Type Detection**: Column types (numeric vs string) auto-detected by sampling first 10 rows
- **Cache Busting**: All HTTP fetches include timestamp query parameter to prevent stale data
- **Relative URL Resolution**: URLs without "/" prefix treated as relative to config_source_path

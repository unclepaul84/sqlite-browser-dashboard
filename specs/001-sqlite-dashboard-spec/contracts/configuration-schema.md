# Configuration Schema Contract

**Feature**: 001-sqlite-dashboard-spec  
**Created**: 2025-10-31  
**Purpose**: Formal JSON schema contract for `index.json` configuration file

## Overview

This contract defines the structure and validation rules for the `index.json` configuration file that controls the SQLite Browser Dashboard.

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["datasets", "dashboard_templates"],
  "properties": {
    "datasets": {
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/definitions/Dataset"
      }
    },
    "dashboard_templates": {
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/definitions/DashboardTemplate"
      }
    }
  },
  "definitions": {
    "Dataset": {
      "type": "object",
      "required": ["title", "db_url", "dashboard_items_tempate"],
      "properties": {
        "title": {
          "type": "string",
          "minLength": 1,
          "description": "Display name shown in dataset dropdown"
        },
        "db_url": {
          "type": "string",
          "minLength": 1,
          "description": "URL or relative path to SQLite database file"
        },
        "dashboard_items_tempate": {
          "type": "string",
          "minLength": 1,
          "description": "Name of dashboard template to use (must exist in dashboard_templates array)"
        }
      },
      "additionalProperties": false
    },
    "DashboardTemplate": {
      "type": "object",
      "required": ["name", "dashboard_items"],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1,
          "description": "Unique identifier for this template"
        },
        "documentation_url": {
          "type": "string",
          "description": "Optional URL or relative path to markdown documentation file"
        },
        "dashboard_items": {
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/DashboardItem"
          }
        }
      },
      "additionalProperties": false
    },
    "DashboardItem": {
      "type": "object",
      "required": ["title", "query"],
      "properties": {
        "title": {
          "type": "string",
          "minLength": 1,
          "description": "Display name for the visualization"
        },
        "query": {
          "type": "string",
          "minLength": 1,
          "description": "SQL query to execute (supports ${variable} substitution if templated)"
        },
        "type": {
          "type": "string",
          "enum": ["grid", "chart"],
          "default": "grid",
          "description": "Visualization type"
        },
        "parent": {
          "type": "string",
          "description": "Title of parent dashboard item (for drill-down functionality)"
        },
        "templated": {
          "type": "boolean",
          "default": false,
          "description": "If true, item is hidden until parent row clicked"
        },
        "grid_row_menus": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/GridRowMenu"
          },
          "description": "Right-click context menu options for grid rows"
        },
        "chartType": {
          "type": "string",
          "enum": ["bar", "line", "pie", "doughnut"],
          "description": "Required when type is 'chart'"
        },
        "options": {
          "type": "object",
          "description": "Required when type is 'chart'",
          "required": ["xField", "yField"],
          "properties": {
            "xField": {
              "type": "string",
              "minLength": 1,
              "description": "Query result column name for X-axis labels"
            },
            "yField": {
              "type": "string",
              "minLength": 1,
              "description": "Query result column name for Y-axis values"
            },
            "title": {
              "type": "string",
              "description": "Optional dataset label for chart legend"
            }
          },
          "additionalProperties": false
        }
      },
      "additionalProperties": false,
      "allOf": [
        {
          "if": {
            "properties": { "type": { "const": "chart" } }
          },
          "then": {
            "required": ["chartType", "options"]
          }
        }
      ]
    },
    "GridRowMenu": {
      "type": "object",
      "required": ["label", "url"],
      "properties": {
        "label": {
          "type": "string",
          "minLength": 1,
          "description": "Menu item display text"
        },
        "url": {
          "type": "string",
          "minLength": 1,
          "description": "URL template (supports ${column_name} substitution)"
        }
      },
      "additionalProperties": false
    }
  }
}
```

## Runtime Validation Rules

Beyond JSON schema, the following rules are enforced by `ConfigValidator.js`:

### Uniqueness Constraints

1. **Template Names**: All `dashboard_templates[].name` values MUST be unique
2. **Dashboard Item Titles**: Within each template, all `dashboard_items[].title` values MUST be unique
3. **Template References**: Each `datasets[].dashboard_items_tempate` value MUST match exactly one template name

### Parent-Child Relationships

1. If `dashboard_items[].parent` is specified, the value MUST match the `title` of another dashboard item in the same template
2. Parent items MUST be defined before child items can reference them (order matters in validation)

### Chart Type Validation

1. If `type === "chart"`, then `chartType` and `options` are required
2. `chartType` MUST be one of: "bar", "line", "pie", "doughnut"
3. `options.xField` and `options.yField` MUST be present for all charts

## Example Request/Response Flow

### Initial Configuration Load

**Request**:
```http
GET ${config_source_path}/index.json?date=1730419200000 HTTP/1.1
Host: example.com
```

**Response** (Success):
```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "datasets": [...],
  "dashboard_templates": [...]
}
```

**Response** (404):
```http
HTTP/1.1 404 Not Found

Error toast displays: "Error loading config file from {url}: Not Found"
```

### Database Load

**Request**:
```http
GET ${config_source_path}/database.sqlite?date=1730419200000 HTTP/1.1
Host: example.com
```

**Response** (Success):
```http
HTTP/1.1 200 OK
Content-Type: application/x-sqlite3
Content-Length: 102400
Access-Control-Allow-Origin: *

<binary SQLite database>
```

**Response** (CORS Error):
```http
HTTP/1.1 200 OK
Content-Type: application/x-sqlite3
(missing CORS header)

Browser blocks response, fetch() fails with CORS error
Error toast displays: "error loading sql database from {url}: Failed to fetch"
```

### Documentation Load (Optional)

**Request**:
```http
GET ${config_source_path}/docs/guide.md?1730419200000 HTTP/1.1
Host: example.com
```

**Response** (Success):
```http
HTTP/1.1 200 OK
Content-Type: text/markdown
Access-Control-Allow-Origin: *

# Dashboard Guide
...markdown content...
```

## Breaking Changes Policy

Configuration schema follows semantic versioning:

### Major Version (Breaking)

Changes requiring user config updates:
- Remove required field
- Change field type
- Rename field
- Remove enum value
- Change validation rules to be more restrictive

**Migration Required**: Yes, with documented upgrade guide

### Minor Version (Non-Breaking)

Backward-compatible additions:
- Add optional field
- Add new enum value
- Relax validation rules
- Add new feature flag

**Migration Required**: No, but new features documented

### Patch Version (Non-Breaking)

Documentation and validation messages only:
- Fix error message typos
- Improve validation error descriptions
- Update documentation

**Migration Required**: No

## Validation Error Reference

All error messages produced by `ConfigValidator.validateConfig()`:

| Error Code | Message Template | Trigger Condition |
|------------|------------------|-------------------|
| VAL-001 | `Missing or invalid 'datasets' array` | datasets is not an array or is null/undefined |
| VAL-002 | `Missing or invalid 'dashboard_templates' array` | dashboard_templates is not an array or is null/undefined |
| VAL-010 | `Dataset[{idx}]: Missing required 'title' field` | dataset.title is falsy |
| VAL-011 | `Dataset[{idx}]: Missing required 'db_url' field` | dataset.db_url is falsy |
| VAL-012 | `Dataset[{idx}]: Missing required 'dashboard_items_tempate' field` | dataset.dashboard_items_tempate is falsy |
| VAL-013 | `Dataset[{idx}]: Referenced template '{name}' not found` | dashboard_items_tempate value not in template names |
| VAL-020 | `Template[{idx}]: Missing required 'name' field` | template.name is falsy |
| VAL-021 | `Template[{idx}]: Duplicate template name '{name}'` | template.name appears multiple times |
| VAL-022 | `Template[{idx}]: Missing or invalid 'dashboard_items' array` | dashboard_items is not an array |
| VAL-030 | `Template[{idx}].items[{itemIdx}]: Missing required 'title' field` | item.title is falsy |
| VAL-031 | `Template[{idx}].items[{itemIdx}]: Duplicate item title '{title}'` | item.title appears multiple times in template |
| VAL-032 | `Template[{idx}].items[{itemIdx}]: Missing required 'query' field` | item.query is falsy |
| VAL-033 | `Template[{idx}].items[{itemIdx}]: Invalid type '{type}'. Must be 'grid' or 'chart'` | item.type not in ['grid', 'chart'] |
| VAL-034 | `Template[{idx}].items[{itemIdx}]: Chart type required for chart visualization` | type='chart' but chartType is falsy |
| VAL-035 | `Template[{idx}].items[{itemIdx}]: Invalid chart type '{chartType}'` | chartType not in ['bar', 'line', 'doughnut', 'pie'] |
| VAL-036 | `Template[{idx}].items[{itemIdx}]: Chart requires options configuration` | type='chart' but options is falsy |
| VAL-037 | `Template[{idx}].items[{itemIdx}]: Chart requires options.xField` | type='chart' but options.xField is falsy |
| VAL-038 | `Template[{idx}].items[{itemIdx}]: Chart requires options.yField` | type='chart' but options.yField is falsy |
| VAL-040 | `Template[{idx}].items[{itemIdx}]: grid_row_menus must be an array` | grid_row_menus is not an array |
| VAL-041 | `Template[{idx}].items[{itemIdx}].menus[{menuIdx}]: Missing required 'label' field` | menu.label is falsy |
| VAL-042 | `Template[{idx}].items[{itemIdx}].menus[{menuIdx}]: Missing required 'url' field` | menu.url is falsy |
| VAL-050 | `Template[{idx}].items[{itemIdx}]: Parent item '{parent}' not found` | item.parent value not in template's itemTitles |
| VAL-100 | `Duplicate dashboard item title found: {title}` | Additional runtime check after ConfigValidator passes |

## Client-Side Implementation

The configuration is validated immediately after fetch:

```javascript
fetch(`${config_source_path}/index.json?date=${new Date()}`).then(resp => {
  resp.json().then(json => {
    // Validation step 1: Schema validation
    const validation = ConfigValidator.validateConfig(json);
    if (!validation.isValid) {
      validation.errors.forEach(error => showErrorToast(`Configuration error: ${error}`));
      return; // Halt execution
    }

    // Validation step 2: Unique titles within templates
    json.dashboard_templates.forEach(template => {
      const titles = new Set();
      template.dashboard_items.forEach(item => {
        if (titles.has(item.title)) {
          showErrorToast(`Duplicate dashboard item title found: ${item.title}`);
          return; // Halt execution
        }
        titles.add(item.title);
      });
    });

    // If validation passes, initialize dashboard
    initializeDashboard(json);
  });
});
```

## Test Cases

### Valid Configuration (Minimal)

```json
{
  "datasets": [
    {
      "title": "Test",
      "db_url": "test.sqlite",
      "dashboard_items_tempate": "default"
    }
  ],
  "dashboard_templates": [
    {
      "name": "default",
      "dashboard_items": [
        {
          "title": "Grid",
          "query": "SELECT * FROM test"
        }
      ]
    }
  ]
}
```

**Expected**: Validation passes, dashboard initializes

### Invalid: Missing Required Field

```json
{
  "datasets": [
    {
      "title": "Test",
      "db_url": "test.sqlite"
      // Missing dashboard_items_tempate
    }
  ],
  "dashboard_templates": [...]
}
```

**Expected**: Error `Dataset[0]: Missing required 'dashboard_items_tempate' field`

### Invalid: Template Reference

```json
{
  "datasets": [
    {
      "title": "Test",
      "db_url": "test.sqlite",
      "dashboard_items_tempate": "nonexistent"  // Template doesn't exist
    }
  ],
  "dashboard_templates": [
    {"name": "default", "dashboard_items": [...]}
  ]
}
```

**Expected**: Error `Dataset[0]: Referenced template 'nonexistent' not found`

### Invalid: Chart Missing Options

```json
{
  "dashboard_items": [
    {
      "title": "Chart",
      "query": "SELECT * FROM data",
      "type": "chart",
      "chartType": "bar"
      // Missing options field
    }
  ]
}
```

**Expected**: Error `Template[0].items[0]: Chart requires options configuration`

### Valid: Complete Chart Configuration

```json
{
  "dashboard_items": [
    {
      "title": "Chart",
      "query": "SELECT category, SUM(amount) as total FROM sales GROUP BY category",
      "type": "chart",
      "chartType": "bar",
      "options": {
        "xField": "category",
        "yField": "total",
        "title": "Sales by Category"
      }
    }
  ]
}
```

**Expected**: Validation passes, chart renders

## Compatibility Matrix

| Dashboard Version | Config Schema Version | Compatibility |
|------------------|----------------------|---------------|
| 1.0.0 | 1.0.0 | ✅ Full |
| 1.1.0 | 1.0.0 | ✅ Backward compatible |
| 2.0.0 | 1.0.0 | ⚠️ May require config updates |
| 1.0.0 | 1.1.0 | ✅ New features ignored |

---

This contract is implemented by `js/configValidator.js` and enforced before any dashboard rendering occurs.

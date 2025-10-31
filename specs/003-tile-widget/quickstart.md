# Quickstart Guide: Tile Widget

**Feature**: Tile Widget Dashboard Component  
**Audience**: Dashboard developers and users  
**Time to Complete**: 10 minutes

## Overview

This guide shows you how to add a tile widget to your SQLite browser dashboard. Tiles display numeric KPIs (Key Performance Indicators) from SQL queries and enable drill-down to detailed grids.

## Prerequisites

- Existing SQLite browser dashboard setup
- SQLite database accessible via HTTP
- Basic understanding of SQL queries
- Text editor for modifying `index.json`

## Step 1: Basic Tile Widget

Add a tile widget as the **first item** in your dashboard configuration.

**Edit `index.json`**:
```json
{
  "datasets": [
    {
      "title": "Sales Dashboard",
      "db_url": "sales.db",
      "dashboard_items_tempate": "sales_template"
    }
  ],
  "dashboard_templates": [
    {
      "name": "sales_template",
      "dashboard_items": [
        {
          "type": "tiles",
          "title": "Sales KPIs",
          "config": {
            "tiles": [
              {
                "name": "Total Orders",
                "query": "SELECT COUNT(*) FROM orders",
                "description": "All orders in system",
                "color": "#2196F3"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Result**: One blue tile showing total order count.

---

## Step 2: Multiple Tiles

Add more tiles to show different metrics.

```json
{
  "type": "tiles",
  "title": "Sales KPIs",
  "config": {
    "tiles": [
      {
        "name": "Active",
        "query": "SELECT COUNT(*) FROM orders WHERE status = 'Active'",
        "description": "Currently processing",
        "color": "#4CAF50"
      },
      {
        "name": "Completed",
        "query": "SELECT COUNT(*) FROM orders WHERE status = 'Completed'",
        "description": "Successfully delivered",
        "color": "#2196F3"
      },
      {
        "name": "Cancelled",
        "query": "SELECT COUNT(*) FROM orders WHERE status = 'Cancelled'",
        "description": "Cancelled by customer",
        "color": "#F44336"
      },
      {
        "name": "Revenue",
        "query": "SELECT SUM(total) FROM orders WHERE status = 'Completed'",
        "description": "Total revenue",
        "color": "#FF9800"
      }
    ]
  }
}
```

**Result**: Four colored tiles showing order counts by status and total revenue.

---

## Step 3: Add Clickable Drill-Down

Make tiles clickable to filter a child grid.

**Add a child grid** after the tile widget:
```json
{
  "dashboard_items": [
    {
      "type": "tiles",
      "title": "Sales KPIs",
      "config": {
        "tiles": [
          {
            "name": "Active",
            "query": "SELECT COUNT(*) FROM orders WHERE status = 'Active'",
            "description": "Currently processing",
            "color": "#4CAF50"
          },
          {
            "name": "Completed",
            "query": "SELECT COUNT(*) FROM orders WHERE status = 'Completed'",
            "description": "Successfully delivered",
            "color": "#2196F3"
          }
        ]
      }
    },
    {
      "type": "grid",
      "title": "Order Details",
      "parent": "Sales KPIs",
      "query": "SELECT * FROM orders WHERE status = '${tile_name}'"
    }
  ]
}
```

**How it works**:
1. User clicks "Active" tile
2. `${tile_name}` in grid query is replaced with "Active"
3. Grid shows: `SELECT * FROM orders WHERE status = 'Active'`
4. Clicking "Completed" tile updates grid to show completed orders

---

## Step 4: Customize Colors

Use any CSS color format for tiles.

**Color Options**:
```json
{
  "tiles": [
    {
      "name": "Named Color",
      "color": "blue"
    },
    {
      "name": "Hex Color",
      "color": "#FF5733"
    },
    {
      "name": "RGB Color",
      "color": "rgb(100, 150, 200)"
    },
    {
      "name": "RGBA Transparent",
      "color": "rgba(76, 175, 80, 0.7)"
    },
    {
      "name": "HSL Color",
      "color": "hsl(200, 50%, 50%)"
    }
  ]
}
```

**Tip**: Text color (black or white) is automatically chosen for readability based on background color.

---

## Step 5: Advanced Queries

Use complex SQL for tile values.

**Aggregations**:
```json
{
  "tiles": [
    {
      "name": "Avg Order Value",
      "query": "SELECT ROUND(AVG(total), 2) FROM orders WHERE status = 'Completed'"
    },
    {
      "name": "Top Customer Orders",
      "query": "SELECT MAX(order_count) FROM (SELECT customer_id, COUNT(*) as order_count FROM orders GROUP BY customer_id)"
    },
    {
      "name": "This Month",
      "query": "SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m', order_date) = strftime('%Y-%m', 'now')"
    }
  ]
}
```

**Note**: Query should return single numeric value (first row, first column used).

---

## Common Patterns

### Pattern 1: Status Breakdown

```json
{
  "tiles": [
    {"name": "Pending", "query": "SELECT COUNT(*) FROM orders WHERE status = 'Pending'", "color": "#FFC107"},
    {"name": "Processing", "query": "SELECT COUNT(*) FROM orders WHERE status = 'Processing'", "color": "#2196F3"},
    {"name": "Shipped", "query": "SELECT COUNT(*) FROM orders WHERE status = 'Shipped'", "color": "#4CAF50"},
    {"name": "Delivered", "query": "SELECT COUNT(*) FROM orders WHERE status = 'Delivered'", "color": "#8BC34A"}
  ]
}
```

### Pattern 2: Time-Based Metrics

```json
{
  "tiles": [
    {"name": "Today", "query": "SELECT COUNT(*) FROM orders WHERE DATE(order_date) = DATE('now')", "color": "#E91E63"},
    {"name": "This Week", "query": "SELECT COUNT(*) FROM orders WHERE strftime('%Y-%W', order_date) = strftime('%Y-%W', 'now')", "color": "#9C27B0"},
    {"name": "This Month", "query": "SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m', order_date) = strftime('%Y-%m', 'now')", "color": "#673AB7"}
  ]
}
```

### Pattern 3: Financial KPIs

```json
{
  "tiles": [
    {"name": "Total Revenue", "query": "SELECT SUM(total) FROM orders WHERE status = 'Completed'", "color": "#4CAF50"},
    {"name": "Pending Revenue", "query": "SELECT SUM(total) FROM orders WHERE status IN ('Pending', 'Processing')", "color": "#FF9800"},
    {"name": "Avg Order", "query": "SELECT ROUND(AVG(total), 2) FROM orders", "color": "#2196F3"}
  ]
}
```

---

## Troubleshooting

### Error: "Tile widget must be the first dashboard item"

**Problem**: Tile widget is not the first item in `dashboard_items` array.

**Solution**: Move tile widget to index 0:
```json
{
  "dashboard_items": [
    {"type": "tiles", ...},    // ✅ Tile widget first
    {"type": "grid", ...},      // Other items after
    {"type": "chart", ...}
  ]
}
```

### Error: "Only one tile widget allowed per dashboard template"

**Problem**: Multiple tile widgets in same template.

**Solution**: Keep only one tile widget, add all tiles to its `config.tiles` array:
```json
{
  "config": {
    "tiles": [
      {...},  // First tile
      {...},  // Second tile
      {...}   // Third tile (NOT separate tile widget)
    ]
  }
}
```

### Error: "Tile widget must contain at least one tile"

**Problem**: `config.tiles` array is empty.

**Solution**: Add at least one tile:
```json
{
  "config": {
    "tiles": [
      {
        "name": "My Tile",
        "query": "SELECT COUNT(*) FROM my_table"
      }
    ]
  }
}
```

### Tile shows "N/A"

**Problem**: Query returns no rows or NULL value.

**Causes**:
- Empty table: `SELECT COUNT(*) FROM empty_table` → returns 0 (but might show "N/A" if result is NULL)
- Invalid condition: `SELECT MAX(value) FROM table WHERE impossible_condition` → NULL
- SQL error: Query syntax is invalid

**Debug**:
1. Test query in custom query modal (double-click dashboard title)
2. Check browser console for SQL errors
3. Verify table/column names exist

### Child grid not filtering when tile clicked

**Problem**: Grid query doesn't use `${tile_name}` variable.

**Solution**: Add template variable to grid query:
```json
{
  "type": "grid",
  "parent": "Sales KPIs",
  "query": "SELECT * FROM orders WHERE status = '${tile_name}'"
}
```

**Note**: Variable name must exactly match tile's `name` field.

---

## Best Practices

### ✅ Do's

- **Use descriptive tile names**: "Active Orders" instead of "Active"
- **Add descriptions**: Help users understand what each tile shows
- **Choose meaningful colors**: Green for positive, red for alerts, blue for neutral
- **Keep queries simple**: Single aggregation (COUNT, SUM, AVG) for best performance
- **Test queries first**: Use custom query modal to verify SQL before adding to config

### ❌ Don'ts

- **Don't add multiple tile widgets**: Only one per template
- **Don't place tile widget after other items**: Must be first
- **Don't use complex multi-row queries**: Tiles show first row/column only
- **Don't forget parent reference**: Child grids need `"parent": "Tile Widget Title"`
- **Don't use spaces in tile names if using in SQL**: Use underscores or camelCase

---

## Next Steps

- **Nested drill-down**: Add multiple levels of grids below tiles
- **Context menus**: Add right-click actions to child grid rows
- **Documentation**: Add markdown docs via `documentation_url` in template
- **Charts**: Combine tile widget with chart visualizations

---

## Complete Example

Full working configuration:

```json
{
  "datasets": [
    {
      "title": "E-Commerce Dashboard",
      "db_url": "ecommerce.db",
      "dashboard_items_tempate": "main_dashboard"
    }
  ],
  "dashboard_templates": [
    {
      "name": "main_dashboard",
      "documentation_url": "readme.md",
      "dashboard_items": [
        {
          "type": "tiles",
          "title": "Order Status KPIs",
          "config": {
            "tiles": [
              {
                "name": "Pending",
                "query": "SELECT COUNT(*) FROM orders WHERE status = 'Pending'",
                "description": "Awaiting payment",
                "color": "#FFC107"
              },
              {
                "name": "Active",
                "query": "SELECT COUNT(*) FROM orders WHERE status = 'Active'",
                "description": "Being processed",
                "color": "#2196F3"
              },
              {
                "name": "Completed",
                "query": "SELECT COUNT(*) FROM orders WHERE status = 'Completed'",
                "description": "Successfully delivered",
                "color": "#4CAF50"
              },
              {
                "name": "Cancelled",
                "query": "SELECT COUNT(*) FROM orders WHERE status = 'Cancelled'",
                "description": "Cancelled orders",
                "color": "#F44336"
              }
            ]
          }
        },
        {
          "type": "grid",
          "title": "Orders by Status",
          "parent": "Order Status KPIs",
          "query": "SELECT order_id, customer_id, order_date, total FROM orders WHERE status = '${tile_name}' ORDER BY order_date DESC"
        },
        {
          "type": "grid",
          "title": "Order Line Items",
          "parent": "Orders by Status",
          "query": "SELECT * FROM line_items WHERE order_id = ${order_id}"
        }
      ]
    }
  ]
}
```

**User Flow**:
1. Click "Active" tile → Shows active orders grid
2. Click order row → Shows line items for that order
3. Click "Completed" tile → Shows completed orders grid
4. Click order row → Shows line items for that order

---

## Reference

**Configuration Schema**:
- `type`: "tiles" (required)
- `title`: string (required, used for parent references)
- `config.tiles`: array of tile objects (required, min 1 tile)
- `tile.name`: string (required, unique recommended)
- `tile.query`: SQL string (required)
- `tile.description`: string (optional)
- `tile.color`: CSS color (optional, default "#4A90E2")

**Template Variables**:
- `${tile_name}`: Replaced with clicked tile's name in child queries

**Validation Rules**: See `contracts/validation-rules.md` for complete list.

---

*For more examples, see `/docs/examples/tiles-example/` directory.*

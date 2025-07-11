# SQLite Browser Dashboard

Browser based (SPA) based dashboard engine for viewing and querying SQLite databases with configurable views and filters.

![image](docs/screenshot.png)

## Features

- Load multiple SQLite databases
- Configurable dashboard templates
- Interactive data grids with filtering and sorting
- Custom SQL query interface
- Nested data views with parent-child relationships
- Real-time header filtering
- Chart visualizations (bar, line, pie, doughnut)
- Row context menus with templated URLs
- GitHub pages hostable
- Supports loading sqlite databases from GitHub pages
- Suports markdown and mermaid rendering in grid


## Live Demo
https://unclepaul84.github.io/sqlite-browser-dashboard/?url=/sqlite-data-host/#dataset/Legislators

## Configuration

#### Example
https://github.com/unclepaul84/sqlite-data-host/blob/main/index.json

Create an `index.json` file with the following structure:

```json
{
  "datasets": [
    {
      "title": "Dataset Name",
      "db_url": "path/to/database.sqlite",
      "dashboard_items_tempate": "template_name"
    }
  ],
  "dashboard_templates": [
    {
      "name": "template_name",
     "documentation_url": "sales.md",
      "dashboard_items": [
        {
          "title": "Sales Grid",
          "type": "grid",
          "query": "SELECT * FROM sales",
          "grid_row_menus": [
            {
              "label": "View Details",
              "url": "https://example.com/sale/${id}"
            }
          ]
        },
        {
          "title": "Sales Chart",
          "type": "chart",
          "chartType": "bar",
          "query": "SELECT category, SUM(amount) as total FROM sales GROUP BY category",
          "options": {
            "xField": "category",
            "yField": "total",
            "title": "Sales by Category"
          }
        },
        {
          "title": "Detail View - ${id}",
          "type": "grid",
          "query": "SELECT * FROM details WHERE parent_id = ${id}",
          "parent": "Sales Grid",
          "templated": true
        }
      ]
    }
  ]
}
```

### Configuration Fields

#### Dashboard Item Configuration
- `type`: Visualization type (`grid` or `chart`)
- `title`: Display name for the view (supports templating with ${variable} when templated=True)
- `query`: SQL query to execute (supports templating)
- `templated`: Boolean indicating if this is a template view
- `parent`: Title of the parent view (for nested(templated) views)
#### Grid Configuration
- `grid_row_menus`: Array of context menu items for grid rows
  - `label`: Display text for the menu item
  - `url`: URL template with row data variables (supports ${variable} syntax)

#### Dashboard Template Configuration
- `name`: Unique identifier for the template
- `documentation_url`: path to markdown file
- `dashboard_items`: Array of view configurations
  - `title`: Display name for the view (supports templating with ${variable})
  - `query`: SQL query to execute (supports templating)
  - `templated`: Boolean indicating if this is a template view
  - `parent`: Title of the parent view (for nested views)

#### Chart Configuration
- `chartType`: Type of chart (`bar`, `line`, `pie`, `doughnut`)
- `options`: Chart display options
  - `xField`: Column name for X-axis data
  - `yField`: Column name for Y-axis data
  - `title`: name of the data point

### Template Variables

Template variables can be used in both titles and queries using `${variable}` syntax when dashboard_item.templated=True. Variables are populated from the parent row's data when clicking on a row.

Example:
```sql
SELECT * FROM orders WHERE customer_id = ${id}
```

## Grid Features

Each grid includes:
- Header filters for each column
- Click-to-sort column headers
- Row count display
- Resizable columns
- Live filtering
- right click menu items (if configured)
- mermaid and markdown rendering in grid cells

### Mermaid and Markdown Rendering
Mermaid diagrams and Markdown content can be rendered directly in grid cells. To have cell rendered as Mermaid or Markdown, use the following syntax in your SQL query:
``` sql
SELECT
  id,
  name,
  markdown_column AS content_md,
  mermaid_column AS content_mermaid

 FROM your_table 
 
 ```
 Nothe that the columns `content_md` and `content_mermaid` will be rendered as Markdown and Mermaid diagrams respectively in the grid cells because the are suffixed with `_md` and `_mermaid`.
 
 ## Custom Queries


The dashboard includes a custom query interface that allows:
- Direct SQL query execution
- Table listing
- Results displayed in a filterable grid

## Usage

1. Fork this repo
1. Enable GitHub Pages on it
2. Create another repo to host index.js and your SqliteDatabase
3. Enable GitHub pages on it
5. Configure your `index.json` file
6. Access the dashboard via URL with `?url=path/to/config/directory` parameter 
7. Select a dataset from the dropdown to load views

## Technical Requirements

- Modern web browser with JavaScript enabled
- Web server to host static files
- SQLite databases accessible via HTTP


## Roadmap
optimize sqlite fetching https://github.com/phiresky/sql.js-httpvfs

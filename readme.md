# SQLite Browser Dashboard

A web-based dashboard for viewing and querying SQLite databases with configurable views and filters.

## Features

- Load multiple SQLite databases
- Configurable dashboard templates
- Interactive data grids with filtering and sorting
- Custom SQL query interface
- Nested data views with parent-child relationships
- Real-time header filtering
- Pagination support

## Configuration

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
      "dashboard_items": [
        {
          "title": "Main View",
          "query": "SELECT * FROM table_name",
          "templated": false
        },
        {
          "title": "Detail View - ${id}",
          "query": "SELECT * FROM details WHERE parent_id = ${id}",
          "parent": "Main View",
          "templated": true
        }
      ]
    }
  ]
}
```

### Configuration Fields

#### Dataset Configuration
- `title`: Display name for the dataset
- `db_url`: URL path to the SQLite database file
- `dashboard_items_tempate`: Name of the template to use for this dataset

#### Dashboard Template Configuration
- `name`: Unique identifier for the template
- `dashboard_items`: Array of view configurations
  - `title`: Display name for the view (supports templating with ${variable})
  - `query`: SQL query to execute (supports templating)
  - `templated`: Boolean indicating if this is a template view
  - `parent`: Title of the parent view (for nested views)

### Template Variables

Template variables can be used in both titles and queries using `${variable}` syntax. Variables are populated from the parent row's data when clicking on a row.

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

## Custom Queries

The dashboard includes a custom query interface that allows:
- Direct SQL query execution
- Table listing
- Results displayed in a filterable grid
- Error handling with toast notifications

## Usage

1. Host the files on a web server
2. Configure your `index.json` file
3. Access the dashboard via URL with `?url=path/to/config/directory`
4. Select a dataset from the dropdown to load views

## Technical Requirements

- Modern web browser with JavaScript enabled
- Web server to host static files
- SQLite databases accessible via HTTP
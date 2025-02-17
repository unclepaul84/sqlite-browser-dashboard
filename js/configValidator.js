class ConfigValidator {
    static validateConfig(config) {
        const errors = [];

        // Validate top-level structure
        if (!config.datasets || !Array.isArray(config.datasets)) {
            errors.push("Missing or invalid 'datasets' array");
        }

        if (!config.dashboard_templates || !Array.isArray(config.dashboard_templates)) {
            errors.push("Missing or invalid 'dashboard_templates' array");
        }

        // Validate datasets
        if (config.datasets) {
            config.datasets.forEach((dataset, idx) => {
                if (!dataset.title) {
                    errors.push(`Dataset[${idx}]: Missing required 'title' field`);
                }
                if (!dataset.db_url) {
                    errors.push(`Dataset[${idx}]: Missing required 'db_url' field`);
                }
                if (!dataset.dashboard_items_tempate) {
                    errors.push(`Dataset[${idx}]: Missing required 'dashboard_items_tempate' field`);
                }
            });
        }

        // Validate dashboard templates
        if (config.dashboard_templates) {
            const templateNames = new Set();
            config.dashboard_templates.forEach((template, idx) => {
                // Check required fields
                if (!template.name) {
                    errors.push(`Template[${idx}]: Missing required 'name' field`);
                } else if (templateNames.has(template.name)) {
                    errors.push(`Template[${idx}]: Duplicate template name '${template.name}'`);
                } else {
                    templateNames.add(template.name);
                }

                if (!template.dashboard_items || !Array.isArray(template.dashboard_items)) {
                    errors.push(`Template[${idx}]: Missing or invalid 'dashboard_items' array`);
                } else {
                    // Validate dashboard items
                    const itemTitles = new Set();
                    template.dashboard_items.forEach((item, itemIdx) => {
                        if (!item.title) {
                            errors.push(`Template[${idx}].items[${itemIdx}]: Missing required 'title' field`);
                        } else if (itemTitles.has(item.title)) {
                            errors.push(`Template[${idx}].items[${itemIdx}]: Duplicate item title '${item.title}'`);
                        } else {
                            itemTitles.add(item.title);
                        }

                        if (!item.query) {
                            errors.push(`Template[${idx}].items[${itemIdx}]: Missing required 'query' field`);
                        }

                        if (item.type === 'chart') {
                            if (!item.chartType) {
                                errors.push(`Template[${idx}].items[${itemIdx}]: Chart type required for chart visualization`);
                            }
                            if (!item.options || !item.options.xField || !item.options.yField) {
                                errors.push(`Template[${idx}].items[${itemIdx}]: Chart requires options.xField and options.yField`);
                            }
                        }

                        if (item.parent && !itemTitles.has(item.parent)) {
                            errors.push(`Template[${idx}].items[${itemIdx}]: Parent item '${item.parent}' not found`);
                        }
                    });
                }
            });

            // Validate template references
            config.datasets.forEach((dataset, idx) => {
                if (!templateNames.has(dataset.dashboard_items_tempate)) {
                    errors.push(`Dataset[${idx}]: Referenced template '${dataset.dashboard_items_tempate}' not found`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Example configuration schema
const configSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["datasets", "dashboard_templates"],
    "properties": {
        "datasets": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["title", "db_url", "dashboard_items_tempate"],
                "properties": {
                    "title": { "type": "string" },
                    "db_url": { "type": "string" },
                    "dashboard_items_tempate": { "type": "string" }
                }
            }
        },
        "dashboard_templates": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["name", "dashboard_items"],
                "properties": {
                    "name": { "type": "string" },
                    "dashboard_items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["title", "query"],
                            "properties": {
                                "title": { "type": "string" },
                                "query": { "type": "string" },
                                "type": { 
                                    "type": "string",
                                    "enum": ["grid", "chart"]
                                },
                                "chartType": { 
                                    "type": "string",
                                    "enum": ["bar", "line", "pie"]
                                },
                                "templated": { "type": "boolean" },
                                "parent": { "type": "string" },
                                "options": {
                                    "type": "object",
                                    "properties": {
                                        "xField": { "type": "string" },
                                        "yField": { "type": "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
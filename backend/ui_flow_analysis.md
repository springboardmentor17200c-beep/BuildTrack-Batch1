# BuildTrack UI Flow & Navigation Analysis

This document outlines the UI flow for accessing Analytics Charts, Individual Project Reports, and where specific dropdowns appear across the platform.

## 1. Project Management Flow (`/projects`)

The **Projects Hub** (`/projects`) is the main entry point for managing and viewing individual projects. 

### Flow & Dropdowns
* **Projects Hub (`/projects`)**: A dashboard with quick links to:
  * Listing (`/projects/list`)
  * Milestones (`/projects/milestones`)
  * Status Dashboard (`/projects/status`)
* **Project Listing (`/projects/list`)**:
  * **Dropdowns**: 
    1. **Category Filter**: Filters the projects list (e.g., Residential, Commercial, Infrastructure).
    2. **Status Filter**: Filters the projects list (e.g., Planning, In Progress, On Hold, Completed).
    3. **Form Dropdown (New Project)**: Select category when creating a new project.
  * **Actions**: Click **"View"** on any project row to navigate to its specific details.
* **Individual Project Reports / Details (`/projects/detail/:id`)**:
  * Navigating here from the listing shows the individual project's specific details, timeline, team assigned, etc.

## 2. Analytics & Charts Flow (`/analytics`)

The **Analytics Hub** (`/analytics`) provides aggregated data visualizations (charts) across all projects.

### Flow & Charts
* **Analytics Hub (`/analytics`)**: The central hub displaying global KPI cards (Budget Used %, Active Projects, Avg Progress, Procurement Value) and links to specific analytics domains.
* **Budget Analytics (`/analytics/budget`)**:
  * **Charts**: Contains a **Pie Chart** showing "Spend by Category" across all projects.
  * **Data**: A table showing the budget vs. spent for *all* projects.
* **Progress Analytics (`/analytics/progress`)**:
  * Displays overall progress trends.
* **Resource Analytics (`/analytics/resources`)**:
  * Tracks resource allocation globally.
* **Procurement Analytics (`/analytics/procurement`)**:
  * Tracks purchase orders and material requisitions.

### Where are the Dropdowns in Analytics?
Currently, the specific domain analytics (like Budget) aggregate data for **all projects**. 
* **Dropdowns for Individual Reports (`/analytics/reports/generate`)**: When generating a report, there will typically be dropdowns to select:
  1. **Project Dropdown**: Select which specific project to generate the report for.
  2. **Report Type Dropdown**: Select the type of report (e.g., Financial, Progress, Material).

## Summary: How to see what?
* **To see Charts**: Go to **Analytics** (`/analytics`) and click on Budget, Progress, Resource, or Procurement.
* **To see Individual Project Details**: Go to **Projects** -> **Listing** (`/projects/list`) -> Click **View** on a specific project.
* **To filter views**: Use the dropdowns in `/projects/list` (Category & Status) to narrow down the data shown in the tables.

-- =========================================================
-- BuildTrack Database Schema
-- Construction Project Management & Site Monitoring Platform
-- Database: PostgreSQL
-- Version: 1.0
-- =========================================================

SET search_path TO buildtrack;

-- =========================================================
-- TABLE: roles
-- Purpose: Stores all user roles in the system.
-- =========================================================

-- =========================================================
-- TABLE: companies
-- Purpose: Stores construction companies registered on BuildTrack.
-- =========================================================

CREATE TABLE companies (

    company_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    company_name VARCHAR(150) NOT NULL,

    company_code VARCHAR(20) NOT NULL UNIQUE,

    company_email VARCHAR(255) NOT NULL UNIQUE,

    company_phone VARCHAR(20) NOT NULL,

    address TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);

-- =========================================================
-- TABLE: roles
-- Purpose: Stores system roles for RBAC.
-- =========================================================

CREATE TABLE roles (

    role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    role_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT

);

-- =========================================================
-- TABLE: workforce_categories
-- Purpose: Stores workforce classifications.
-- =========================================================

CREATE TABLE workforce_categories (

    workforce_category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT

);

-- =========================================================
-- TABLE: project_categories
-- Purpose: Stores project categories.
-- =========================================================

CREATE TABLE project_categories (

    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT

);

-- =========================================================
-- TABLE: project_statuses
-- Purpose: Stores project statuses.
-- =========================================================

CREATE TABLE project_statuses (

    status_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    status_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT

);

-- =========================================================
-- TABLE: resource_categories
-- Purpose: Stores resource categories.
-- =========================================================

CREATE TABLE resource_categories (

    resource_category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT

);

-- =========================================================
-- TABLE: material_categories
-- Purpose: Stores material categories.
-- =========================================================

CREATE TABLE material_categories (

    material_category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT

);

-- =========================================================
-- TABLE: expense_categories
-- Purpose: Stores expense categories.
-- =========================================================

CREATE TABLE expense_categories (

    expense_category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT

);

-- =========================================================
-- TABLE: users
-- Purpose: Stores all authenticated users.
-- =========================================================

CREATE TABLE users (

    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    company_id INTEGER,

    role_id INTEGER NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    phone_number VARCHAR(20) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    registration_status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (registration_status IN ('Pending', 'Approved', 'Rejected')),

    approved_by INTEGER,

    approved_at TIMESTAMP,

    rejected_reason TEXT,

    last_login TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id),

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id),

    CONSTRAINT fk_users_approved_by
        FOREIGN KEY (approved_by)
        REFERENCES users(user_id)
);

CREATE TABLE clients (

    client_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    client_code VARCHAR(20) NOT NULL UNIQUE,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    phone_number VARCHAR(20),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);
-- =========================================================
-- TABLE: projects
-- Purpose: Stores construction projects.
-- =========================================================

CREATE TABLE projects (

    project_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    company_id INTEGER NOT NULL,

    manager_id INTEGER NOT NULL,

    client_id INTEGER NOT NULL,

    category_id INTEGER NOT NULL,

    status_id INTEGER NOT NULL,

    project_name VARCHAR(150) NOT NULL,

    description TEXT,

    location TEXT NOT NULL,

    start_date DATE NOT NULL,

    expected_end_date DATE NOT NULL,

    actual_end_date DATE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id),

    CONSTRAINT fk_projects_manager
        FOREIGN KEY (manager_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_projects_client
        FOREIGN KEY (client_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_projects_category
        FOREIGN KEY (category_id)
        REFERENCES project_categories(category_id),

    CONSTRAINT fk_projects_status
        FOREIGN KEY (status_id)
        REFERENCES project_statuses(status_id),

    CONSTRAINT uq_company_project
        UNIQUE (company_id, project_name)

);

-- =========================================================
-- TABLE: employee_profiles
-- Purpose: Stores workforce information.
-- =========================================================

CREATE TABLE employee_profiles (

    employee_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    workforce_category_id INTEGER NOT NULL,

    project_id INTEGER NOT NULL,

    employee_code VARCHAR(30) NOT NULL UNIQUE,

    joining_date DATE NOT NULL,

    experience_years DECIMAL(4,1),

    pay_rate DECIMAL(10,2) NOT NULL,

    payment_type VARCHAR(20) NOT NULL,

    employment_status VARCHAR(20) NOT NULL DEFAULT 'Active',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_employee_category
        FOREIGN KEY (workforce_category_id)
        REFERENCES workforce_categories(workforce_category_id),

    CONSTRAINT fk_employee_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
);

-- =========================================================
-- TABLE: project_milestones
-- Purpose: Stores project milestones.
-- =========================================================

CREATE TABLE project_milestones (

    milestone_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    project_id INTEGER NOT NULL,

    milestone_name VARCHAR(150) NOT NULL,

    description TEXT,

    due_date DATE NOT NULL,

    completion_date DATE,

    status VARCHAR(30) NOT NULL DEFAULT 'Pending',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_milestones_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id),

    CONSTRAINT uq_project_milestone
        UNIQUE (project_id, milestone_name)

);

-- =========================================================
-- TABLE: progress_categories
-- Purpose: Stores site progress categories.
-- =========================================================

CREATE TABLE progress_categories (

    progress_category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT

);

-- =========================================================
-- TABLE: progress_reports
-- Purpose: Stores daily and weekly project progress reports.
-- =========================================================

CREATE TABLE progress_reports (

    report_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    project_id INTEGER NOT NULL,

    submitted_by INTEGER NOT NULL,

    progress_category_id INTEGER NOT NULL,

    report_type VARCHAR(20) NOT NULL,

    work_completed TEXT NOT NULL,

    progress_percentage DECIMAL(5,2),

    delay_reason TEXT,

    report_date DATE NOT NULL,

    remarks TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_progress_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id),

    CONSTRAINT fk_progress_user
        FOREIGN KEY (submitted_by)
        REFERENCES users(user_id),

    CONSTRAINT fk_progress_category
        FOREIGN KEY (progress_category_id)
        REFERENCES progress_categories(progress_category_id)

);

-- =========================================================
-- TABLE: site_activity_logs
-- Purpose: Stores site activity history.
-- =========================================================

CREATE TABLE site_activity_logs (

    activity_log_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    project_id INTEGER NOT NULL,

    recorded_by INTEGER NOT NULL,

    activity_title VARCHAR(150) NOT NULL,

    activity_description TEXT NOT NULL,

    activity_date TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id),

    CONSTRAINT fk_activity_user
        FOREIGN KEY (recorded_by)
        REFERENCES users(user_id)

);

-- =========================================================
-- TABLE: resources
-- Purpose: Stores company-owned equipment and machinery.
-- =========================================================

CREATE TABLE resources (

    resource_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    company_id INTEGER NOT NULL,

    resource_category_id INTEGER NOT NULL,

    resource_name VARCHAR(100) NOT NULL,

    manufacturer VARCHAR(100),

    model_number VARCHAR(100),

    serial_number VARCHAR(100) UNIQUE,

    purchase_date DATE,

    current_status VARCHAR(30) NOT NULL DEFAULT 'Available',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_resources_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id),

    CONSTRAINT fk_resources_category
        FOREIGN KEY (resource_category_id)
        REFERENCES resource_categories(resource_category_id)

);

-- =========================================================
-- TABLE: resource_allocations
-- Purpose: Tracks project-wise resource allocation.
-- =========================================================

CREATE TABLE resource_allocations (

    allocation_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    resource_id INTEGER NOT NULL,

    project_id INTEGER NOT NULL,

    allocated_by INTEGER NOT NULL,

    allocation_date DATE NOT NULL,

    expected_return_date DATE,

    actual_return_date DATE,

    allocation_status VARCHAR(30) NOT NULL DEFAULT 'Allocated',

    remarks TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_allocation_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(resource_id),

    CONSTRAINT fk_allocation_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id),

    CONSTRAINT fk_allocation_user
        FOREIGN KEY (allocated_by)
        REFERENCES users(user_id)

);

-- =========================================================
-- TABLE: maintenance_records
-- Purpose: Stores maintenance history of resources.
-- =========================================================

CREATE TABLE maintenance_records (

    maintenance_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    resource_id INTEGER NOT NULL,

    maintenance_type VARCHAR(100) NOT NULL,

    maintenance_date DATE NOT NULL,

    next_maintenance_date DATE,

    maintenance_cost DECIMAL(12,2),

    serviced_by VARCHAR(150),

    remarks TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_maintenance_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(resource_id)

);

-- =========================================================
-- TABLE: materials
-- Purpose: Stores master material information.
-- =========================================================

CREATE TABLE materials (

    material_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    material_category_id INTEGER NOT NULL,

    material_name VARCHAR(150) NOT NULL,

    unit_of_measure VARCHAR(20) NOT NULL,

    description TEXT,

    CONSTRAINT fk_material_category
        FOREIGN KEY (material_category_id)
        REFERENCES material_categories(material_category_id),

    CONSTRAINT uq_material_name
        UNIQUE (material_name)

);

-- =========================================================
-- TABLE: inventory
-- Purpose: Stores company inventory.
-- =========================================================

CREATE TABLE inventory (

    inventory_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    company_id INTEGER NOT NULL,

    material_id INTEGER NOT NULL,

    available_quantity DECIMAL(12,2) NOT NULL DEFAULT 0,

    minimum_stock_level DECIMAL(12,2),

    storage_location VARCHAR(150),

    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id),

    CONSTRAINT fk_inventory_material
        FOREIGN KEY (material_id)
        REFERENCES materials(material_id),

    CONSTRAINT uq_company_material
        UNIQUE(company_id, material_id)

);

-- =========================================================
-- TABLE: inventory_transactions
-- Purpose: Stores inventory movement history.
-- =========================================================

CREATE TABLE inventory_transactions (

    transaction_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    inventory_id INTEGER NOT NULL,

    project_id INTEGER,

    transaction_type VARCHAR(30) NOT NULL,

    quantity DECIMAL(12,2) NOT NULL,

    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    remarks TEXT,

    created_by INTEGER NOT NULL,

    CONSTRAINT fk_transaction_inventory
        FOREIGN KEY (inventory_id)
        REFERENCES inventory(inventory_id),

    CONSTRAINT fk_transaction_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id),

    CONSTRAINT fk_transaction_user
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)

);

-- =========================================================
-- TABLE: material_requests
-- Purpose: Stores material requests from projects.
-- =========================================================

CREATE TABLE material_requests (

    request_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    project_id INTEGER NOT NULL,

    requested_by INTEGER NOT NULL,

    material_id INTEGER NOT NULL,

    requested_quantity DECIMAL(12,2) NOT NULL,

    request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    request_status VARCHAR(30) NOT NULL DEFAULT 'Pending',

    remarks TEXT,

    CONSTRAINT fk_request_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id),

    CONSTRAINT fk_request_user
        FOREIGN KEY (requested_by)
        REFERENCES users(user_id),

    CONSTRAINT fk_request_material
        FOREIGN KEY (material_id)
        REFERENCES materials(material_id)

);

-- =========================================================
-- TABLE: vendors
-- Purpose: Stores vendor/supplier information.
-- =========================================================

CREATE TABLE vendors (

    vendor_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    company_id INTEGER NOT NULL,

    vendor_name VARCHAR(150) NOT NULL,

    contact_person VARCHAR(100),

    email VARCHAR(255),

    phone_number VARCHAR(20),

    address TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vendor_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id),

    CONSTRAINT uq_company_vendor
        UNIQUE(company_id, vendor_name)

);

-- =========================================================
-- TABLE: procurement_requests
-- Purpose: Stores procurement requests.
-- =========================================================

CREATE TABLE procurement_requests (

    procurement_request_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    project_id INTEGER NOT NULL,

    requested_by INTEGER NOT NULL,

    request_type VARCHAR(30) NOT NULL,

    description TEXT NOT NULL,

    request_status VARCHAR(30) NOT NULL DEFAULT 'Pending',

    request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    remarks TEXT,

    CONSTRAINT fk_procurement_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id),

    CONSTRAINT fk_procurement_user
        FOREIGN KEY (requested_by)
        REFERENCES users(user_id)

);

-- =========================================================
-- TABLE: purchase_orders
-- Purpose: Stores purchase orders.
-- =========================================================

CREATE TABLE purchase_orders (

    purchase_order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    company_id INTEGER NOT NULL,

    project_id INTEGER NOT NULL,

    vendor_id INTEGER NOT NULL,

    procurement_request_id INTEGER,

    order_date DATE NOT NULL,

    expected_delivery_date DATE,

    total_amount DECIMAL(15,2) NOT NULL,

    order_status VARCHAR(30) NOT NULL DEFAULT 'Pending',

    created_by INTEGER NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_po_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id),

    CONSTRAINT fk_po_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id),

    CONSTRAINT fk_po_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES vendors(vendor_id),

    CONSTRAINT fk_po_request
        FOREIGN KEY (procurement_request_id)
        REFERENCES procurement_requests(procurement_request_id),

    CONSTRAINT fk_po_user
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)

);

-- =========================================================
-- TABLE: purchase_order_items
-- Purpose: Stores items within a purchase order.
-- =========================================================

CREATE TABLE purchase_order_items (

    purchase_order_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    purchase_order_id INTEGER NOT NULL,

    material_id INTEGER NOT NULL,

    quantity DECIMAL(12,2) NOT NULL,

    unit_price DECIMAL(12,2) NOT NULL,

    total_price DECIMAL(15,2) NOT NULL,

    CONSTRAINT fk_poi_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders(purchase_order_id),

    CONSTRAINT fk_poi_material
        FOREIGN KEY (material_id)
        REFERENCES materials(material_id)

);

-- =========================================================
-- TABLE: invoices
-- Purpose: Stores vendor invoices.
-- =========================================================

CREATE TABLE invoices (

    invoice_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    purchase_order_id INTEGER NOT NULL,

    invoice_number VARCHAR(100) NOT NULL UNIQUE,

    invoice_date DATE NOT NULL,

    invoice_amount DECIMAL(15,2) NOT NULL,

    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending',

    due_date DATE,

    remarks TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoice_po
        FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders(purchase_order_id)

);

-- =========================================================
-- TABLE: budgets
-- Purpose: Stores project budgets.
-- =========================================================

CREATE TABLE budgets (

    budget_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    project_id INTEGER NOT NULL UNIQUE,

    estimated_cost DECIMAL(15,2) NOT NULL,

    approved_budget DECIMAL(15,2) NOT NULL,

    budget_status VARCHAR(30) NOT NULL DEFAULT 'Planned',

    remarks TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)

);

-- =========================================================
-- TABLE: expenses
-- Purpose: Stores project expenses.
-- =========================================================

CREATE TABLE expenses (

    expense_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    budget_id INTEGER NOT NULL,

    expense_category_id INTEGER NOT NULL,

    recorded_by INTEGER NOT NULL,

    expense_title VARCHAR(150) NOT NULL,

    amount DECIMAL(15,2) NOT NULL,

    expense_date DATE NOT NULL,

    description TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expense_budget
        FOREIGN KEY (budget_id)
        REFERENCES budgets(budget_id),

    CONSTRAINT fk_expense_category
        FOREIGN KEY (expense_category_id)
        REFERENCES expense_categories(expense_category_id),

    CONSTRAINT fk_expense_user
        FOREIGN KEY (recorded_by)
        REFERENCES users(user_id)

);

-- =========================================================
-- TABLE: notifications
-- Purpose: Stores user notifications.
-- =========================================================

CREATE TABLE notifications (

    notification_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    notification_type VARCHAR(50) NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)

);


-- ============================================
-- BUILDTRACK DATABASE SCHEMA
-- Milestone 1
-- ============================================

-- USERS
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(30) NOT NULL CHECK (
        role IN (
            'ADMIN',
            'PROJECT_MANAGER',
            'SITE_ENGINEER',
            'CONTRACTOR',
            'WORKER',
            'CLIENT'
        )
    ),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------

-- PROJECTS
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    location TEXT,
    description TEXT,
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    budget NUMERIC(15,2),
    status VARCHAR(30) DEFAULT 'PLANNING',
    manager_id INT,

    CONSTRAINT fk_project_manager
    FOREIGN KEY(manager_id)
    REFERENCES users(user_id)
    ON DELETE SET NULL
);

--------------------------------------------------

-- PROJECT MILESTONES
CREATE TABLE project_milestones (
    milestone_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    milestone_name VARCHAR(120),
    description TEXT,
    due_date DATE,
    completed_date DATE,

    completion_percentage INT
    DEFAULT 0
    CHECK(completion_percentage BETWEEN 0 AND 100),

    status VARCHAR(30),

    CONSTRAINT fk_project
    FOREIGN KEY(project_id)
    REFERENCES projects(project_id)
    ON DELETE CASCADE
);

--------------------------------------------------

-- RESOURCES
CREATE TABLE resources (
    resource_id SERIAL PRIMARY KEY,
    resource_name VARCHAR(100),
    resource_type VARCHAR(50),
    quantity INT,
    available_quantity INT,
    resource_condition VARCHAR(30),
    assigned_project INT,

    CONSTRAINT fk_resource_project
    FOREIGN KEY(assigned_project)
    REFERENCES projects(project_id)
);

--------------------------------------------------

-- INVENTORY
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    material_name VARCHAR(100),
    category VARCHAR(50),
    quantity INT,
    unit VARCHAR(20),
    minimum_stock INT,
    supplier VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------

-- WORKERS
CREATE TABLE workers (
    worker_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    designation VARCHAR(50),
    phone VARCHAR(15),
    salary NUMERIC(10,2),
    joining_date DATE,

    project_id INT,
    contractor_id INT,

    CONSTRAINT fk_worker_project
    FOREIGN KEY(project_id)
    REFERENCES projects(project_id),

    CONSTRAINT fk_worker_contractor
    FOREIGN KEY(contractor_id)
    REFERENCES users(user_id)
);

--------------------------------------------------

-- ATTENDANCE
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,

    worker_id INT,

    attendance_date DATE,

    check_in TIME,

    check_out TIME,

    status VARCHAR(20),

    CONSTRAINT fk_attendance_worker
    FOREIGN KEY(worker_id)
    REFERENCES workers(worker_id)
    ON DELETE CASCADE
);

--------------------------------------------------

-- PROCUREMENTS
CREATE TABLE procurements (
    procurement_id SERIAL PRIMARY KEY,

    vendor_name VARCHAR(120),

    material_name VARCHAR(120),

    quantity INT,

    total_cost NUMERIC(12,2),

    purchase_date DATE,

    invoice_number VARCHAR(50),

    project_id INT,

    CONSTRAINT fk_procurement_project
    FOREIGN KEY(project_id)
    REFERENCES projects(project_id)
);

--------------------------------------------------

-- NOTIFICATIONS
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,

    user_id INT,

    title VARCHAR(150),

    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
    FOREIGN KEY(user_id)
    REFERENCES users(user_id)
);

--------------------------------------------------

-- REPORTS
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,

    report_type VARCHAR(50),

    generated_by INT,

    project_id INT,

    report_path TEXT,

    generated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_user
    FOREIGN KEY(generated_by)
    REFERENCES users(user_id),

    CONSTRAINT fk_report_project
    FOREIGN KEY(project_id)
    REFERENCES projects(project_id)
);
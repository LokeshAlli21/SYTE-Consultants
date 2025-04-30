-------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------TABLE Promoters-------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------

-- Creating the Promoters table with promoter type and status
CREATE TABLE promoters (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each promoter
    promoter_name VARCHAR(255) NOT NULL,  -- Promoter's name
    contact_number VARCHAR(15),  -- Contact number (adjust length as per your needs)
    email_id VARCHAR(255) ,  -- Email id (unique)
    district VARCHAR(100) NOT NULL,  -- District where the promoter is located
    city VARCHAR(100) NOT NULL,  -- City where the promoter is located
    promoter_type VARCHAR(50) NOT NULL,  -- Type of the promoter (e.g., "Agent", "Manager", etc.)
    status VARCHAR(20) DEFAULT 'active',  -- Status of the promoter (default to 'active')
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),  -- Automatically stores the creation time in IST
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')  -- Automatically stores the update time in IST
);

-- Creating a trigger function to update the 'updated_at' column on row updates
CREATE OR REPLACE FUNCTION update_promoter_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';  -- Set the updated_at to the current time in IST
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger to automatically update the 'updated_at' column when a row is updated
CREATE TRIGGER update_promoter_updated_at
BEFORE UPDATE ON promoters
FOR EACH ROW
EXECUTE FUNCTION update_promoter_timestamp();


-- Creating the PromoteDetails table with foreign key to Promoters
CREATE TABLE promoterdetails (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each promoter's details
    full_name VARCHAR(255),  -- Full name of the promoter
    office_address TEXT,  -- Office address of the promoter
    aadhar_number VARCHAR(12) ,  -- Aadhar number (12 digits, unique)
    aadhar_uploaded_url TEXT,  -- URL where the Aadhar document is uploaded
    pan_number VARCHAR(10) ,  -- PAN number (10 characters, unique)
    pan_uploaded_url TEXT,  -- URL where the PAN document is uploaded
    dob DATE,  -- Date of birth
    contact_person_name VARCHAR(255),  -- Contact person name
    partnership_pan_number VARCHAR(10),  -- Partnership firm's PAN number
    partnership_pan_uploaded_url TEXT,  -- URL where partnership PAN document is uploaded
    company_pan_number VARCHAR(10),  -- Company's PAN number
    company_pan_uploaded_url TEXT,  -- URL where company's PAN document is uploaded
    company_incorporation_number VARCHAR(20),  -- Company incorporation number
    company_incorporation_uploaded_url TEXT,  -- URL where incorporation document is uploaded
    promoter_id INT NOT NULL,  -- Foreign key linking to Promoters table
    profile_photo_uploaded_url TEXT,
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),  -- Creation timestamp
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),  -- Update timestamp

    -- Adding Foreign Key Constraint
    CONSTRAINT fk_promoter
        FOREIGN KEY (promoter_id) 
        REFERENCES promoters(id)
        ON DELETE CASCADE
);

-------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------TABLE Projects-------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------

-- Creating the Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each project
    channel_partner VARCHAR(255),  -- Channel partner associated with the project
    promoter_id INT NOT NULL,  -- Foreign key linking to Promoters table (NOT NULL)
    promoter_name VARCHAR(255),  -- 
    project_name VARCHAR(255) NOT NULL,  -- Project name (NOT NULL)
    project_type VARCHAR(100),  -- Type of the project (e.g., Residential, Commercial, etc.)
    project_address TEXT,  -- Full address of the project
    project_pincode VARCHAR(6),  -- Pincode of the project's location
    login_id VARCHAR(255),  -- Login ID for the project
    password VARCHAR(255),  -- Password for the project
    district VARCHAR(100),  -- District where the project is located
    city VARCHAR(100),  -- City where the project is located
    rera_number VARCHAR(100),  -- RERA number (Real Estate Regulatory Authority)
    rera_certificate_uploaded_url TEXT,  -- URL where the RERA certificate is uploaded
    registration_date DATE,  -- Date when the project was registered
    expiry_date DATE,  -- Expiry date of the project
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),  -- Automatically stores creation time in IST
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),  -- Automatically stores update time in IST

    -- Adding Foreign Key Constraint
    CONSTRAINT fk_promoter
        FOREIGN KEY (promoter_id) 
        REFERENCES promoters(id)
        ON DELETE CASCADE
);

-- Creating a trigger function to update the 'updated_at' column on row updates
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';  -- Set the updated_at to the current time in IST
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger to automatically update the 'updated_at' column when a row is updated
CREATE TRIGGER update_project_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_project_timestamp();

-------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------TABLE ProjectProfessionalDetails-------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------


-- Creating the ProjectProfessionalDetails table
CREATE TABLE project_professional_details (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each record
    project_id INT NOT NULL,  -- Foreign key to Projects table

    -- Engineer Details
    engineer_name VARCHAR(255),
    engineer_contact_number VARCHAR(15),
    engineer_email_id VARCHAR(255),
    engineer_office_address TEXT,
    engineer_licence_number VARCHAR(100),
    engineer_licence_uploaded_url TEXT,
    engineer_pan_number VARCHAR(10),
    engineer_pan_uploaded_url TEXT,
    engineer_letter_head_uploaded_url TEXT,
    engineer_sign_stamp_uploaded_url TEXT,

    -- Architect Details
    architect_name VARCHAR(255),
    architect_contact_number VARCHAR(15),
    architect_email_id VARCHAR(255),
    architect_office_address TEXT,
    architect_licence_number VARCHAR(100),
    architect_licence_uploaded_url TEXT,
    architect_pan_number VARCHAR(10),
    architect_pan_uploaded_url TEXT,
    architect_letter_head_uploaded_url TEXT,
    architect_sign_stamp_uploaded_url TEXT,

    -- CA (Chartered Accountant) Details
    ca_name VARCHAR(255),
    ca_contact_number VARCHAR(15),
    ca_email_id VARCHAR(255),
    ca_office_address TEXT,
    ca_licence_number VARCHAR(100),
    ca_licence_uploaded_url TEXT,
    ca_pan_number VARCHAR(10),
    ca_pan_uploaded_url TEXT,
    ca_letter_head_uploaded_url TEXT,
    ca_sign_stamp_uploaded_url TEXT,

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),

    -- Foreign key constraint
    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);

-- Trigger function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_project_professional_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on row updates
CREATE TRIGGER update_project_professional_updated_at
BEFORE UPDATE ON project_professional_details
FOR EACH ROW
EXECUTE FUNCTION update_project_professional_timestamp();

-------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------TABLE ProjectUnits-------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------

-- Creating the ProjectUnits table
CREATE TABLE project_units (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each unit
    project_id INT NOT NULL,  -- Foreign key to Projects table

    -- Unit Details
    unit_name VARCHAR(255),
    unit_type VARCHAR(100),
    carpet_area NUMERIC(10, 2),  -- Area in square feet or meters
    unit_status VARCHAR(50),  -- e.g., Available, Booked, Sold

    -- Customer Details
    customer_name VARCHAR(255),
    agreement_value NUMERIC(15, 2),
    agreement_or_sale_deed_date DATE,

    -- Financial Year Received Amounts (FY 2018-19 to FY 2029-30)
    received_fy_2018_19 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2019_20 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2020_21 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2021_22 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2022_23 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2023_24 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2024_25 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2025_26 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2026_27 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2027_28 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2028_29 NUMERIC(15, 2) DEFAULT 0,
    received_fy_2029_30 NUMERIC(15, 2) DEFAULT 0,

    -- Aggregated Financials
    total_received NUMERIC(15, 2) DEFAULT 0,
    balance_amount NUMERIC(15, 2) DEFAULT 0,

    -- Documents
    afs_uploaded_url TEXT,  -- Agreement for Sale uploaded document
    sale_deed_uploaded_url TEXT,

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),

    -- Foreign Key Constraint
    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_project_unit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on update
CREATE TRIGGER update_project_unit_updated_at
BEFORE UPDATE ON project_units
FOR EACH ROW
EXECUTE FUNCTION update_project_unit_timestamp();

-------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------TABLE project_documents-------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------


-- Creating the ProjectDocuments table
CREATE TABLE project_documents (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each record
    project_id INT NOT NULL,  -- Foreign key to Projects table

    -- Document URLs
    cc_uploaded_url TEXT,  -- Completion Certificate
    plan_uploaded_url TEXT,  -- Project Plan
    search_report_uploaded_url TEXT,  -- Search Report
    da_uploaded_url TEXT,  -- Development Agreement
    pa_uploaded_url TEXT,  -- Power of Attorney
    satbara_uploaded_url TEXT,  -- 7/12 Extract
    promoter_letter_head_uploaded_url TEXT,  -- Promoter's Letter Head
    promoter_sign_stamp_uploaded_url TEXT,  -- Promoter's Sign & Stamp

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),

    -- Foreign Key Constraint
    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_project_documents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on row updates
CREATE TRIGGER update_project_documents_updated_at
BEFORE UPDATE ON project_documents
FOR EACH ROW
EXECUTE FUNCTION update_project_documents_timestamp();

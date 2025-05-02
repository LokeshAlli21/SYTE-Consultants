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
    status_for_delete VARCHAR(20) DEFAULT 'active',  -- Status of the promoter (default to 'active')
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
CREATE TABLE promoter_details (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each promoter's details

    -- Adding Foreign Key Constraint
    CONSTRAINT fk_promoter
        FOREIGN KEY (promoter_id) 
        REFERENCES promoters(id)
        ON DELETE CASCADE,

    full_name VARCHAR(255),  -- Full name of the promoter
    office_address TEXT,  -- Office address of the promoter
    aadhar_number NUMERIC(12, 0) ,  -- Aadhar number (12 digits, unique)
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
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')  -- Update timestamp

);

-------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------TABLE Projects-------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------

-- Creating the Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each project

    -- Adding Foreign Key Constraint
    CONSTRAINT fk_promoter
        FOREIGN KEY (promoter_id) 
        REFERENCES promoters(id)
        ON DELETE CASCADE,

    channel_partner VARCHAR(255),  -- Channel partner associated with the project
    promoter_id INT NOT NULL,  -- Foreign key linking to Promoters table (NOT NULL)
    promoter_name VARCHAR(255),  -- 
    project_name VARCHAR(255) NOT NULL,  -- Project name (NOT NULL)
    project_type VARCHAR(100),  -- Type of the project (e.g., Residential, Commercial, etc.)
    project_address TEXT,  -- Full address of the project
    project_pincode NUMERIC(10, 0),  -- Pincode of the project's location
    login_id VARCHAR(255),  -- Login ID for the project
    password VARCHAR(255),  -- Password for the project
    district VARCHAR(100),  -- District where the project is located
    city VARCHAR(100),  -- City where the project is located
    rera_number VARCHAR(100),  -- RERA number (Real Estate Regulatory Authority)
    rera_certificate_uploaded_url TEXT,  -- URL where the RERA certificate is uploaded
    registration_date DATE,  -- Date when the project was registered
    expiry_date DATE,  -- Expiry date of the project
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),  -- Automatically stores creation time in IST
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')  -- Automatically stores update time in IST

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

CREATE TABLE engineers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    contact_number VARCHAR(15),
    email_id VARCHAR(255),
    office_address TEXT,
    licence_number VARCHAR(100),
    licence_uploaded_url TEXT,
    pan_number VARCHAR(10),
    pan_uploaded_url TEXT,
    letter_head_uploaded_url TEXT,
    sign_stamp_uploaded_url TEXT
);

CREATE TABLE architects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    contact_number VARCHAR(15),
    email_id VARCHAR(255),
    office_address TEXT,
    licence_number VARCHAR(100),
    licence_uploaded_url TEXT,
    pan_number VARCHAR(10),
    pan_uploaded_url TEXT,
    letter_head_uploaded_url TEXT,
    sign_stamp_uploaded_url TEXT
);

CREATE TABLE cas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    contact_number VARCHAR(15),
    email_id VARCHAR(255),
    office_address TEXT,
    licence_number VARCHAR(100),
    licence_uploaded_url TEXT,
    pan_number VARCHAR(10),
    pan_uploaded_url TEXT,
    letter_head_uploaded_url TEXT,
    sign_stamp_uploaded_url TEXT
);


-- Creating the ProjectProfessionalDetails table
CREATE TABLE project_professional_details (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each record

    -- Foreign key constraint
    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    project_id INT NOT NULL,  -- Foreign key to Projects table

    -- Engineer Details
    engineer_id INT REFERENCES engineers(id),

    -- Architect Details
   architect_id INT REFERENCES architects(id),

    -- CA (Chartered Accountant) Details
    ca_id INT REFERENCES cas(id),

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')

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

    -- Foreign Key Constraint
    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

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

    -- Aggregated Financials (Total Received from all years)
    total_received NUMERIC(15, 2) DEFAULT 0,

    -- Balance amount based on agreement_value and total_received
    balance_amount NUMERIC(15, 2) DEFAULT 0,

    -- Documents
    afs_uploaded_url TEXT,  -- Agreement for Sale uploaded document
    sale_deed_uploaded_url TEXT,

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')

);


-- Create trigger function to calculate total_received
CREATE OR REPLACE FUNCTION update_total_received_and_balance_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_received := NEW.received_fy_2018_19 + NEW.received_fy_2019_20 + 
                          NEW.received_fy_2020_21 + NEW.received_fy_2021_22 + 
                          NEW.received_fy_2022_23 + NEW.received_fy_2023_24 + 
                          NEW.received_fy_2024_25 + NEW.received_fy_2025_26 + 
                          NEW.received_fy_2026_27 + NEW.received_fy_2027_28 + 
                          NEW.received_fy_2028_29 + NEW.received_fy_2029_30;

    NEW.balance_amount := NEW.agreement_value - NEW.total_received;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'total_received' and 'balance_amount' before insert or update
CREATE TRIGGER update_project_unit_total_received_balance
BEFORE INSERT OR UPDATE ON project_units
FOR EACH ROW
EXECUTE FUNCTION update_total_received_and_balance_amount();




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

    -- Foreign Key Constraint
    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

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
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')

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

-------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------TABLE site_progress-------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------

---------------------- project_building_progress ----------------------
-- 1.	excavation              : Excavation	
-- 2.	basement                : Basements (if any)	
-- 3.	podium                  : Podiums (if any)	
-- 4.	plinth                  : Plinth	
-- 5.	stilt                   : Stilt Floor	
-- 6.	superstructure          : Slabs of Super Structure	
-- 7.	interior_finishing      : Internal walls, Internal Plaster, Floorings, Doors and Windows within Flats/Premises	
-- 8.	sanitary_fittings       : Sanitary Fittings within the Flat/Premises	
-- 9.	common_infrastructure   : Staircases, Lifts Wells and Lobbies at each Floor level, Overhead and Underground Water Tanks	
-- 10.	external_works          : External plumbing and external plaster, elevation, completion of terraces with waterproofing of the Building/Wing.	
-- 11.	final_installations     : Installation of lifts, water pumps, Fire Fighting Fittings And Equipment as per CFO NOC, Electrical fittings, mechanical equipment, Compliance to conditions of environment/CRZ NOC, Finishing to entrance lobby/s, plinth protection, paving of areas appurtenant to Building / Wing, Compound Wall and all other requirements as maybe required to complete project as per specifications in agreement of Sale. Any other activities.	

---------------------- project_common_areas_progress  ------------------
-- 1.	Internal Roads&Footpaths			
-- 2.	Water Supply			
-- 3.	Sewerage (chamber, lines, Septic Tank, STP)			
-- 4.	Storm Water Drains			
-- 5.	Landscaping & Tree Planting			
-- 6.	Street Lighting			
-- 7.	Community Buildings			
-- 8.	Treatment and disposal of sewage and sullage water			
-- 9.	Solid Waste management & Disposal			
-- 10.	Water conservation, Rain water harvesting			
-- 11.	Energy management			
-- 12.	Fire protectionAnd fire safety requirements			
-- 13.	Electrical meter room, sub-station, receiving station			


-- Creating the SiteProgress table
CREATE TABLE site_progress (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,

    CONSTRAINT fk_project_site_progress
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    -- project_building_progress 
    excavation NUMERIC(5,2) CHECK (excavation BETWEEN 0 AND 100),   -- 1. Excavation
    basement NUMERIC(5,2) CHECK (basement BETWEEN 0 AND 100),       -- 2. Basements (if any)
    podium NUMERIC(5,2) CHECK (podium BETWEEN 0 AND 100),           -- 3. Podiums (if any)	
    plinth NUMERIC(5,2) CHECK (plinth BETWEEN 0 AND 100),           -- 4. Plinth	
    stilt NUMERIC(5,2) CHECK (stilt BETWEEN 0 AND 100),                                 -- 5. Stilt Floor	
    superstructure NUMERIC(5,2) CHECK (superstructure BETWEEN 0 AND 100),               -- 6.	Slabs of Super Structure	
    interior_finishing NUMERIC(5,2) CHECK (interior_finishing BETWEEN 0 AND 100),       -- 7.	nternal walls, Internal Plaster, Floorings, Doors and Windows within Flats/Premises	
    sanitary_fittings NUMERIC(5,2) CHECK (sanitary_fittings BETWEEN 0 AND 100),         -- 8. Sanitary Fittings within the Flat/Premises	
    common_infrastructure NUMERIC(5,2) CHECK (common_infrastructure BETWEEN 0 AND 100), -- 9. Staircases, Lifts Wells and Lobbies at each Floor level, Overhead and Underground Water Tanks	
    external_works NUMERIC(5,2) CHECK (external_works BETWEEN 0 AND 100),               -- 10. External plumbing and external plaster, elevation, completion of terraces with waterproofing of the Building/Wing.	
    final_installations NUMERIC(5,2) CHECK (final_installations BETWEEN 0 AND 100),      -- 11. Installation of lifts, water pumps, Fire Fighting Fittings And Equipment as per CFO NOC, Electrical fittings, mechanical equipment, Compliance to conditions of environment/CRZ NOC, Finishing to entrance lobby/s, plinth protection, paving of areas appurtenant to Building / Wing, Compound Wall and all other requirements as maybe required to complete project as per specifications in agreement of Sale. Any other activities.	

    -- project_common_areas_progress 
    
        -- {
        -- "proposed": true,
        -- "percentage_of_work": 80.5,
        -- "details": "STP completed and tested"
        -- }
    internal_roads_footpaths JSONB, -- 1.	Internal Roads&Footpaths
    water_supply JSONB,             -- 2.	Water Supply
    sewerage JSONB,                 -- 3.	Sewerage (chamber, lines, Septic Tank, STP)	
    storm_water_drains JSONB,       -- 4.	Storm Water Drains		
    landscaping_tree_planting JSONB,-- 5.	Landscaping & Tree Planting	
    street_lighting JSONB,          -- 6.	Street Lighting		
    community_buildings JSONB,      -- 7.	Community Buildings	
    sewage_treatment JSONB,         -- 8.	Treatment and disposal of sewage and sullage water	
    solid_waste_management JSONB,   -- 9.	Solid Waste management & Disposal	
    rain_water_harvesting JSONB,    -- 10.	Water conservation, Rain water harvesting
    energy_management JSONB,        -- 11.	Energy management
    fire_safety JSONB,              -- 12.	Fire protectionAnd fire safety requirements	
    electrical_metering JSONB,      -- 13.	Electrical meter room, sub-station, receiving station

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')

);

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_site_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on row updates
CREATE TRIGGER update_site_progress_updated_at
BEFORE UPDATE ON site_progress
FOR EACH ROW
EXECUTE FUNCTION update_site_progress_timestamp();


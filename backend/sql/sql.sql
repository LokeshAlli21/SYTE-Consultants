-- Creating the Promoters table with promoter type and status
CREATE TABLE Promoters (
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
BEFORE UPDATE ON Promoters
FOR EACH ROW
EXECUTE FUNCTION update_promoter_timestamp();


-- Creating the PromoteDetails table with foreign key to Promoters
CREATE TABLE PromoterDetails (
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
        REFERENCES Promoters(id)
        ON DELETE CASCADE
);

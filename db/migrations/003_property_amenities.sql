CREATE TABLE property_amenities(id uuid PRIMARY KEY,property_id uuid NOT NULL REFERENCES properties ON DELETE CASCADE,name text NOT NULL,description text NOT NULL DEFAULT '',verification verification_state NOT NULL DEFAULT 'Realtor-provided',source_reference text NOT NULL DEFAULT '',updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX amenities_property ON property_amenities(property_id);

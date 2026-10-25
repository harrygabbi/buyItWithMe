ALTER TABLE property_rooms ADD COLUMN verification verification_state NOT NULL DEFAULT 'Realtor-provided';
ALTER TABLE property_rooms ADD COLUMN source_reference text NOT NULL DEFAULT '';

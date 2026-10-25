// Question inventory transcribed from BaseLine Questions/{Core,Essential,Enrichment}.md.
// Repeated permit/report questions and monthly strata fees are asked once in their first section.
// Original Milestone 1 fields remain in the main form; later capabilities are informational only.
export interface BaselineField {
  key: string;
  label: string;
  kind: "text" | "textarea" | "number" | "date" | "select";
  options?: string[];
  hint?: string;
  min?: number;
  step?: string;
}
export interface BaselineSection {
  id: string;
  category: "Core" | "Essential" | "Enrichment";
  title: string;
  fields: BaselineField[];
  planned: { label: string; description: string }[];
}
export const BASELINE_SECTIONS: BaselineSection[] = [
  {
    id: "core_property_identification",
    category: "Core",
    title: "Property identification",
    fields: [
      {
        key: "core_unit_suite_number",
        label: "Unit / suite number",
        kind: "text",
      },
      {
        key: "core_city_province_postal_code",
        label: "City, province, postal code",
        kind: "text",
      },
      {
        key: "core_listing_status",
        label: "Listing status",
        kind: "select",
        options: ["Active", "Pending", "Sold", "Off market"],
      },
      {
        key: "core_property_ownership_tenure_type",
        label: "Property ownership / tenure type",
        kind: "select",
        options: [
          "Freehold",
          "Strata freehold",
          "Leasehold",
          "Co-operative",
          "Other",
        ],
      },
    ],
    planned: [],
  },
  {
    id: "core_size_and_layout",
    category: "Core",
    title: "Size and layout",
    fields: [
      {
        key: "core_unfinished_square_footage_if_applicable",
        label: "Unfinished square footage (if applicable)",
        kind: "number",
        min: 0,
        step: "any",
      },
      {
        key: "core_number_of_floors",
        label: "Number of floors",
        kind: "number",
        min: 0,
        step: "1",
      },
      {
        key: "core_total_room_count",
        label: "Total room count",
        kind: "number",
        min: 0,
        step: "1",
      },
      {
        key: "core_basic_layout_description",
        label: "Basic layout description",
        kind: "textarea",
      },
      {
        key: "core_basement_availability",
        label: "Basement availability",
        kind: "select",
        options: [
          "No basement",
          "Finished",
          "Unfinished",
          "Partially finished",
          "Unknown",
        ],
      },
      {
        key: "core_zoning_rs1_rs2_need_more_info",
        label: "Zoning designation",
        kind: "text",
        hint: "Enter the verified designation and source; no zoning lookup is connected.",
      },
    ],
    planned: [],
  },
  {
    id: "core_key_property_features",
    category: "Core",
    title: "Key property features",
    fields: [
      {
        key: "core_parking_spaces",
        label: "Parking spaces",
        kind: "number",
        min: 0,
        step: "1",
      },
      {
        key: "core_garage_availability",
        label: "Garage availability",
        kind: "select",
        options: ["Yes", "No", "Unknown"],
      },
      {
        key: "core_balcony_patio_yard",
        label: "Balcony / patio / yard",
        kind: "text",
      },
      {
        key: "core_heating_system",
        label: "Heating system",
        kind: "text",
      },
      {
        key: "core_cooling_air_conditioning",
        label: "Cooling / air conditioning",
        kind: "select",
        options: [
          "Central air",
          "Heat pump",
          "Window / portable units",
          "None",
          "Other",
          "Unknown",
        ],
      },
      {
        key: "core_included_appliances",
        label: "Included appliances",
        kind: "textarea",
      },
      {
        key: "core_major_amenities",
        label: "Major amenities",
        kind: "textarea",
      },
      {
        key: "core_storage_availability",
        label: "Storage availability",
        kind: "select",
        options: ["Yes", "No", "Unknown"],
      },
      {
        key: "core_secondary_suite_if_applicable",
        label: "Secondary suite (if applicable)",
        kind: "select",
        options: ["Yes", "No", "Not applicable", "Unknown"],
      },
    ],
    planned: [],
  },
  {
    id: "core_financial_basics",
    category: "Core",
    title: "Financial basics",
    fields: [
      {
        key: "core_annual_property_tax",
        label: "Annual property tax",
        kind: "number",
        min: 0,
        step: "any",
      },
      {
        key: "core_monthly_strata_fees_if_applicable",
        label: "Monthly strata fees (if applicable)",
        kind: "number",
        min: 0,
        step: "any",
      },
      {
        key: "core_strata_fee_inclusions_if_applicable",
        label: "Strata fee inclusions (if applicable)",
        kind: "textarea",
      },
      {
        key: "core_special_levies_assessments_if_applicable",
        label: "Special levies / assessments (if applicable)",
        kind: "text",
      },
      {
        key: "core_possession_availability_date",
        label: "Possession / availability date",
        kind: "date",
      },
    ],
    planned: [],
  },
  {
    id: "core_open_house_setup",
    category: "Core",
    title: "Open-house setup",
    fields: [
      {
        key: "core_open_house_date_and_time",
        label: "Open-house date and time (planning note)",
        kind: "text",
        hint: "Planning information only. This does not schedule or publish an open house.",
      },
      {
        key: "core_realtor_name",
        label: "Realtor name",
        kind: "text",
      },
      {
        key: "core_brokerage",
        label: "Brokerage",
        kind: "text",
      },
      {
        key: "core_public_realtor_contact",
        label: "Public realtor contact",
        kind: "text",
        hint: "Business contact details approved for public use only.",
      },
      {
        key: "core_agent_confirmation_of_published_facts",
        label: "Agent confirmation of published facts",
        kind: "select",
        options: ["Not yet reviewed", "Confirmed by realtor"],
      },
    ],
    planned: [
      {
        label: "Property photos",
        description:
          "Photo uploads are coming later. Demonstration listings use bundled sample photos.",
      },
      {
        label: "Unique QR / NFC property link",
        description: "QR and NFC links are coming in a later milestone.",
      },
    ],
  },
  {
    id: "core_safety_disclosures_and_permissions",
    category: "Core",
    title: "Safety, disclosures and permissions",
    fields: [
      {
        key: "core_known_material_latent_defects_handled_through_required_disclosures",
        label: "Public disclosure references",
        kind: "textarea",
        hint: "Reference approved disclosures. Do not enter private seller details or sensitive documents.",
      },
      {
        key: "core_approved_public_property_information",
        label: "Approved public property information",
        kind: "select",
        options: ["Not yet reviewed", "Approved for public use"],
      },
      {
        key: "core_sensitive_information_excluded_from_public_ai",
        label: "Sensitive information excluded from public AI",
        kind: "select",
        options: ["Not yet reviewed", "Confirmed excluded"],
      },
      {
        key: "core_realtor_approved_documents",
        label: "Realtor-approved documents",
        kind: "textarea",
      },
      {
        key: "core_document_and_media_sharing_rights",
        label: "Document and media sharing rights",
        kind: "select",
        options: [
          "Not yet reviewed",
          "Rights confirmed",
          "Permission required",
        ],
      },
      {
        key: "core_ai_handoff_contact",
        label: "AI handoff contact",
        kind: "text",
        hint: "Business contact details approved for public use only.",
      },
    ],
    planned: [],
  },
  {
    id: "essential_room_by_room_information",
    category: "Essential",
    title: "Room-by-room information",
    fields: [
      {
        key: "essential_individual_room_names",
        label: "Individual room names",
        kind: "text",
      },
      {
        key: "essential_bedroom_dimensions",
        label: "Bedroom dimensions",
        kind: "textarea",
      },
      {
        key: "essential_living_room_dimensions",
        label: "Living room dimensions",
        kind: "textarea",
      },
      {
        key: "essential_dining_room_dimensions",
        label: "Dining room dimensions",
        kind: "textarea",
      },
      {
        key: "essential_kitchen_dimensions",
        label: "Kitchen dimensions",
        kind: "textarea",
      },
      {
        key: "essential_bathroom_locations",
        label: "Bathroom locations",
        kind: "textarea",
      },
      {
        key: "essential_home_office_den",
        label: "Home office / den",
        kind: "text",
      },
      {
        key: "essential_laundry_room",
        label: "Laundry room",
        kind: "text",
      },
      {
        key: "essential_closet_wardrobe_space",
        label: "Closet / wardrobe space",
        kind: "text",
      },
      {
        key: "essential_walk_in_closets",
        label: "Walk-in closets",
        kind: "text",
      },
      {
        key: "essential_basement_rooms_and_dimensions",
        label: "Basement rooms and dimensions",
        kind: "textarea",
      },
      {
        key: "essential_ceiling_height_per_room",
        label: "Ceiling height per room",
        kind: "text",
      },
      {
        key: "essential_flooring_per_room",
        label: "Flooring per room",
        kind: "text",
      },
      {
        key: "essential_separate_entrance_locations",
        label: "Separate entrance locations",
        kind: "textarea",
      },
      {
        key: "essential_room_by_room_accessibility",
        label: "Room-by-room accessibility",
        kind: "text",
      },
    ],
    planned: [],
  },
  {
    id: "essential_windows_and_doors",
    category: "Essential",
    title: "Windows and doors",
    fields: [
      {
        key: "essential_total_window_count",
        label: "Total window count",
        kind: "number",
        min: 0,
        step: "1",
      },
      {
        key: "essential_windows_per_room",
        label: "Windows per room",
        kind: "text",
      },
      {
        key: "essential_window_dimensions",
        label: "Window dimensions",
        kind: "textarea",
      },
      {
        key: "essential_window_material",
        label: "Window material",
        kind: "text",
      },
      {
        key: "essential_window_age_replacement_dates",
        label: "Window age / replacement dates",
        kind: "text",
      },
      {
        key: "essential_operable_fixed_windows",
        label: "Operable / fixed windows",
        kind: "text",
      },
      {
        key: "essential_blinds_curtains_included",
        label: "Blinds / curtains included",
        kind: "text",
      },
      {
        key: "essential_skylights",
        label: "Skylights",
        kind: "text",
      },
      {
        key: "essential_patio_doors",
        label: "Patio doors",
        kind: "text",
      },
      {
        key: "essential_exterior_door_type",
        label: "Exterior door type",
        kind: "text",
      },
      {
        key: "essential_doorway_dimensions",
        label: "Doorway dimensions",
        kind: "textarea",
      },
      {
        key: "essential_window_door_warranties",
        label: "Window / door warranties",
        kind: "textarea",
      },
    ],
    planned: [],
  },
  {
    id: "essential_kitchen_and_appliances",
    category: "Essential",
    title: "Kitchen and appliances",
    fields: [
      {
        key: "essential_refrigerator_brand_and_model",
        label: "Refrigerator brand and model",
        kind: "text",
      },
      {
        key: "essential_stove_cooktop",
        label: "Stove / cooktop",
        kind: "text",
      },
      {
        key: "essential_oven",
        label: "Oven",
        kind: "text",
      },
      {
        key: "essential_microwave",
        label: "Microwave",
        kind: "text",
      },
      {
        key: "essential_dishwasher",
        label: "Dishwasher",
        kind: "text",
      },
      {
        key: "essential_range_hood",
        label: "Range hood",
        kind: "text",
      },
      {
        key: "essential_washer_dryer",
        label: "Washer / dryer",
        kind: "text",
      },
      {
        key: "essential_water_filtration",
        label: "Water filtration",
        kind: "text",
      },
      {
        key: "essential_kitchen_island",
        label: "Kitchen island",
        kind: "text",
      },
      {
        key: "essential_countertop_material",
        label: "Countertop material",
        kind: "text",
      },
      {
        key: "essential_cabinet_material",
        label: "Cabinet material",
        kind: "text",
      },
      {
        key: "essential_pantry",
        label: "Pantry",
        kind: "text",
      },
      {
        key: "essential_appliance_ages",
        label: "Appliance ages",
        kind: "text",
      },
      {
        key: "essential_appliance_warranties",
        label: "Appliance warranties",
        kind: "textarea",
      },
      {
        key: "essential_gas_electric_connections",
        label: "Gas / electric connections",
        kind: "text",
      },
      {
        key: "essential_additional_kitchen",
        label: "Additional kitchen",
        kind: "text",
      },
      {
        key: "essential_excluded_appliances",
        label: "Excluded appliances",
        kind: "textarea",
      },
    ],
    planned: [],
  },
  {
    id: "essential_heating_cooling_plumbing_and_electrical",
    category: "Essential",
    title: "Heating, cooling, plumbing and electrical",
    fields: [
      {
        key: "essential_heating_equipment_type_and_age",
        label: "Heating equipment type and age",
        kind: "text",
      },
      {
        key: "essential_heat_pump_furnace_boiler",
        label: "Heat pump / furnace / boiler",
        kind: "text",
      },
      {
        key: "essential_air_conditioning_type",
        label: "Air conditioning type",
        kind: "text",
      },
      {
        key: "essential_hot_water_system_and_age",
        label: "Hot-water system and age",
        kind: "text",
      },
      {
        key: "essential_water_pressure_information",
        label: "Water pressure information",
        kind: "textarea",
      },
      {
        key: "essential_plumbing_updates",
        label: "Plumbing updates",
        kind: "textarea",
      },
      {
        key: "essential_electrical_panel_amperage",
        label: "Electrical panel amperage",
        kind: "number",
        min: 0,
        step: "1",
      },
      {
        key: "essential_wiring_updates",
        label: "Wiring updates",
        kind: "textarea",
      },
      {
        key: "essential_gas_availability",
        label: "Gas availability",
        kind: "text",
      },
      {
        key: "essential_ventilation_hrv",
        label: "Ventilation / HRV",
        kind: "text",
      },
      {
        key: "essential_smart_thermostat",
        label: "Smart thermostat",
        kind: "text",
      },
      {
        key: "essential_solar_equipment",
        label: "Solar equipment",
        kind: "text",
      },
      {
        key: "essential_ev_charger",
        label: "EV charger",
        kind: "text",
      },
      {
        key: "essential_water_sewer_infrastructure",
        label: "Water / sewer infrastructure",
        kind: "text",
      },
      {
        key: "essential_internet_connectivity_options",
        label: "Internet connectivity options",
        kind: "text",
      },
    ],
    planned: [],
  },
  {
    id: "essential_interior_features_and_accessibility",
    category: "Essential",
    title: "Interior features and accessibility",
    fields: [
      {
        key: "essential_fireplaces",
        label: "Fireplaces",
        kind: "text",
      },
      {
        key: "essential_built_in_shelving",
        label: "Built-in shelving",
        kind: "text",
      },
      {
        key: "essential_smart_home_features",
        label: "Smart home features",
        kind: "text",
      },
      {
        key: "essential_soundproofing",
        label: "Soundproofing",
        kind: "text",
      },
      {
        key: "essential_lighting_fixtures",
        label: "Lighting fixtures",
        kind: "text",
      },
      {
        key: "essential_stair_count",
        label: "Stair count",
        kind: "number",
        min: 0,
        step: "1",
      },
      {
        key: "essential_stair_configuration",
        label: "Stair configuration",
        kind: "text",
      },
      {
        key: "essential_elevator_lift",
        label: "Elevator / lift",
        kind: "text",
      },
      {
        key: "essential_accessibility_ramps",
        label: "Accessibility ramps",
        kind: "text",
      },
      {
        key: "essential_step_free_entry",
        label: "Step-free entry",
        kind: "text",
      },
      {
        key: "essential_door_clearance",
        label: "Door clearance",
        kind: "text",
      },
      {
        key: "essential_wheelchair_accessible_bathrooms",
        label: "Wheelchair-accessible bathrooms",
        kind: "text",
      },
      {
        key: "essential_security_alarm_system",
        label: "Security / alarm system",
        kind: "text",
      },
    ],
    planned: [],
  },
  {
    id: "essential_exterior_and_land",
    category: "Essential",
    title: "Exterior and land",
    fields: [
      {
        key: "essential_front_yard_size",
        label: "Front yard size",
        kind: "text",
      },
      {
        key: "essential_backyard_size",
        label: "Backyard size",
        kind: "text",
      },
      {
        key: "essential_deck_dimensions",
        label: "Deck dimensions",
        kind: "textarea",
      },
      {
        key: "essential_balcony_dimensions",
        label: "Balcony dimensions",
        kind: "textarea",
      },
      {
        key: "essential_patio_dimensions",
        label: "Patio dimensions",
        kind: "textarea",
      },
      {
        key: "essential_roof_type_and_age",
        label: "Roof type and age",
        kind: "text",
      },
      {
        key: "essential_exterior_siding",
        label: "Exterior siding",
        kind: "text",
      },
      {
        key: "essential_fencing",
        label: "Fencing",
        kind: "text",
      },
      {
        key: "essential_landscaping",
        label: "Landscaping",
        kind: "text",
      },
      {
        key: "essential_gardens",
        label: "Gardens",
        kind: "text",
      },
      {
        key: "essential_storage_shed",
        label: "Storage shed",
        kind: "text",
      },
      {
        key: "essential_pool_hot_tub",
        label: "Pool / hot tub",
        kind: "text",
      },
      {
        key: "essential_outdoor_lighting",
        label: "Outdoor lighting",
        kind: "text",
      },
      {
        key: "essential_driveway_dimensions",
        label: "Driveway dimensions",
        kind: "textarea",
      },
      {
        key: "essential_drainage",
        label: "Drainage",
        kind: "text",
      },
      {
        key: "essential_sun_exposure",
        label: "Sun exposure",
        kind: "text",
      },
      {
        key: "essential_property_views",
        label: "Property views",
        kind: "text",
      },
      {
        key: "essential_lot_slope",
        label: "Lot slope",
        kind: "text",
      },
      {
        key: "essential_easements",
        label: "Easements",
        kind: "text",
      },
    ],
    planned: [],
  },
  {
    id: "essential_parking_and_storage",
    category: "Essential",
    title: "Parking and storage",
    fields: [
      {
        key: "essential_assigned_parking_spots",
        label: "Assigned parking spots",
        kind: "number",
        min: 0,
        step: "1",
      },
      {
        key: "essential_garage_dimensions",
        label: "Garage dimensions",
        kind: "textarea",
      },
      {
        key: "essential_parking_clearance",
        label: "Parking clearance",
        kind: "text",
      },
      {
        key: "essential_driveway_capacity",
        label: "Driveway capacity",
        kind: "number",
        min: 0,
        step: "1",
      },
      {
        key: "essential_visitor_parking",
        label: "Visitor parking",
        kind: "text",
      },
      {
        key: "essential_street_parking_rules",
        label: "Street parking rules",
        kind: "textarea",
      },
      {
        key: "essential_ev_charging",
        label: "EV charging",
        kind: "text",
      },
      {
        key: "essential_bike_storage",
        label: "Bike storage",
        kind: "text",
      },
      {
        key: "essential_storage_locker_dimensions",
        label: "Storage locker dimensions",
        kind: "textarea",
      },
      {
        key: "essential_storage_locker_allocation",
        label: "Storage locker allocation",
        kind: "text",
      },
      {
        key: "essential_parking_fees",
        label: "Parking fees",
        kind: "number",
        min: 0,
        step: "any",
      },
    ],
    planned: [],
  },
  {
    id: "essential_strata_and_building_management",
    category: "Essential",
    title: "Strata and building management",
    fields: [
      {
        key: "essential_strata_corporation_plan",
        label: "Strata corporation / plan",
        kind: "text",
      },
      {
        key: "essential_strata_fee_breakdown",
        label: "Strata fee breakdown",
        kind: "text",
      },
      {
        key: "essential_fee_history",
        label: "Fee history",
        kind: "textarea",
      },
      {
        key: "essential_contingency_reserve_fund",
        label: "Contingency reserve fund",
        kind: "text",
      },
      {
        key: "essential_special_levies",
        label: "Special levies",
        kind: "text",
      },
      {
        key: "essential_depreciation_report",
        label: "Depreciation report",
        kind: "text",
      },
      {
        key: "essential_pet_bylaws",
        label: "Pet bylaws",
        kind: "textarea",
      },
      {
        key: "essential_rental_bylaws",
        label: "Rental bylaws",
        kind: "textarea",
      },
      {
        key: "essential_age_restrictions_where_applicable",
        label: "Age restrictions where applicable",
        kind: "textarea",
      },
      {
        key: "essential_smoking_restrictions",
        label: "Smoking restrictions",
        kind: "textarea",
      },
      {
        key: "essential_bbq_rules",
        label: "BBQ rules",
        kind: "textarea",
      },
      {
        key: "essential_renovation_restrictions",
        label: "Renovation restrictions",
        kind: "textarea",
      },
      {
        key: "essential_move_in_move_out_fees",
        label: "Move-in / move-out fees",
        kind: "text",
      },
      {
        key: "essential_shared_amenities",
        label: "Shared amenities",
        kind: "textarea",
      },
      {
        key: "essential_amenity_booking_costs",
        label: "Amenity booking costs",
        kind: "textarea",
      },
      {
        key: "essential_caretaker_concierge",
        label: "Caretaker / concierge",
        kind: "text",
      },
      {
        key: "essential_strata_insurance_summary",
        label: "Strata insurance summary",
        kind: "text",
      },
      {
        key: "essential_insurance_deductibles",
        label: "Insurance deductibles",
        kind: "text",
      },
      {
        key: "essential_meeting_minutes",
        label: "Meeting minutes",
        kind: "text",
      },
      {
        key: "essential_pending_major_repairs",
        label: "Pending major repairs",
        kind: "textarea",
      },
      {
        key: "essential_building_envelope_history",
        label: "Building envelope history",
        kind: "textarea",
      },
      {
        key: "essential_form_b_information",
        label: "Form B information",
        kind: "textarea",
      },
    ],
    planned: [],
  },
  {
    id: "essential_property_history_and_condition",
    category: "Essential",
    title: "Property history and condition",
    fields: [
      {
        key: "essential_renovations_and_dates",
        label: "Renovations and dates",
        kind: "text",
      },
      {
        key: "essential_renovation_permits",
        label: "Renovation permits",
        kind: "text",
      },
      {
        key: "essential_roof_replacement_history",
        label: "Roof replacement history",
        kind: "textarea",
      },
      {
        key: "essential_plumbing_repairs",
        label: "Plumbing repairs",
        kind: "textarea",
      },
      {
        key: "essential_electrical_repairs",
        label: "Electrical repairs",
        kind: "textarea",
      },
      {
        key: "essential_water_leaks_or_damage",
        label: "Water leaks or damage",
        kind: "text",
      },
      {
        key: "essential_mold_moisture_history",
        label: "Mold / moisture history",
        kind: "textarea",
      },
      {
        key: "essential_foundation_issues",
        label: "Foundation issues",
        kind: "text",
      },
      {
        key: "essential_pest_history",
        label: "Pest history",
        kind: "textarea",
      },
      {
        key: "essential_fire_flood_damage",
        label: "Fire / flood damage",
        kind: "text",
      },
      {
        key: "essential_inspection_reports",
        label: "Inspection reports",
        kind: "text",
      },
      {
        key: "essential_property_disclosure_statement",
        label: "Property Disclosure Statement",
        kind: "text",
      },
      {
        key: "essential_warranties",
        label: "Warranties",
        kind: "textarea",
      },
      {
        key: "essential_known_defects",
        label: "Known defects",
        kind: "textarea",
      },
      {
        key: "essential_outstanding_permits_work_orders",
        label: "Outstanding permits / work orders",
        kind: "text",
      },
      {
        key: "essential_title_charges_and_covenants",
        label: "Title charges and covenants",
        kind: "text",
      },
      {
        key: "essential_heritage_restrictions",
        label: "Heritage restrictions",
        kind: "textarea",
      },
      {
        key: "essential_oil_tank_information",
        label: "Oil tank information",
        kind: "textarea",
      },
    ],
    planned: [],
  },
  {
    id: "essential_ownership_and_ongoing_costs",
    category: "Essential",
    title: "Ownership and ongoing costs",
    fields: [
      {
        key: "essential_annual_property_tax_and_tax_year",
        label: "Annual property tax and tax year",
        kind: "text",
      },
      {
        key: "essential_historical_utilities",
        label: "Historical utilities",
        kind: "text",
      },
      {
        key: "essential_electricity_cost",
        label: "Electricity cost",
        kind: "textarea",
      },
      {
        key: "essential_gas_cost",
        label: "Gas cost",
        kind: "textarea",
      },
      {
        key: "essential_water_sewer_cost",
        label: "Water / sewer cost",
        kind: "textarea",
      },
      {
        key: "essential_home_insurance_information_when_available",
        label: "Home insurance information when available",
        kind: "textarea",
      },
      {
        key: "essential_rental_equipment_contracts",
        label: "Rental equipment contracts",
        kind: "text",
      },
      {
        key: "essential_additional_monthly_fees",
        label: "Additional monthly fees",
        kind: "text",
      },
      {
        key: "essential_included_fixtures_and_chattels",
        label: "Included fixtures and chattels",
        kind: "text",
      },
      {
        key: "essential_excluded_items",
        label: "Excluded items",
        kind: "text",
      },
      {
        key: "essential_leasehold_terms_if_applicable",
        label: "Leasehold terms (if applicable)",
        kind: "textarea",
      },
      {
        key: "essential_new_home_warranty_if_applicable",
        label: "New-home warranty (if applicable)",
        kind: "text",
      },
      {
        key: "essential_relevant_tax_status",
        label: "Relevant tax status",
        kind: "text",
      },
    ],
    planned: [],
  },
  {
    id: "essential_property_media_and_documentation",
    category: "Essential",
    title: "Property media and documentation",
    fields: [
      {
        key: "essential_detailed_photo_gallery",
        label: "Detailed photo gallery",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_photos_labeled_by_room",
        label: "Photos labeled by room",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_floor_plan_blueprint",
        label: "Floor plan / blueprint",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_room_dimensions_verified_against_floor_plan",
        label: "Room dimensions verified against floor plan",
        kind: "textarea",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_property_disclosure_documents",
        label: "Property disclosure documents",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_strata_documents",
        label: "Strata documents",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_appliance_manuals",
        label: "Appliance manuals",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_equipment_warranties",
        label: "Equipment warranties",
        kind: "textarea",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_utility_statements",
        label: "Utility statements",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_survey_site_plan",
        label: "Survey / site plan",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
      {
        key: "essential_source_and_update_date_for_documents",
        label: "Source and update date for documents",
        kind: "text",
        hint: "Public document title, reference, or update notes only. Uploads are not available.",
      },
    ],
    planned: [],
  },
  {
    id: "enrichment_schools_and_education",
    category: "Enrichment",
    title: "Schools and education",
    fields: [
      {
        key: "enrichment_nearby_elementary_schools",
        label: "Nearby elementary schools",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_nearby_secondary_schools",
        label: "Nearby secondary schools",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_school_district",
        label: "School district",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_official_catchment_information",
        label: "Official catchment information",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_walking_driving_distance",
        label: "Walking / driving distance",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_public_independent_schools",
        label: "Public / independent schools",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_french_immersion_specialty_programs",
        label: "French immersion / specialty programs",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_daycare_and_preschool",
        label: "Daycare and preschool",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_universities_and_colleges",
        label: "Universities and colleges",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_school_capacity_enrollment_information_where_published",
        label: "School capacity / enrollment information where published",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
    ],
    planned: [],
  },
  {
    id: "enrichment_shopping_and_daily_necessities",
    category: "Enrichment",
    title: "Shopping and daily necessities",
    fields: [
      {
        key: "enrichment_nearby_grocery_stores",
        label: "Nearby grocery stores",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_supermarkets",
        label: "Supermarkets",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_specialty_grocery_stores",
        label: "Specialty grocery stores",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_pharmacies",
        label: "Pharmacies",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_shopping_malls",
        label: "Shopping malls",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_convenience_stores",
        label: "Convenience stores",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_banks_and_atms",
        label: "Banks and ATMs",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_restaurants",
        label: "Restaurants",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_cafes",
        label: "Cafes",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_post_offices",
        label: "Post offices",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_gas_stations",
        label: "Gas stations",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
    ],
    planned: [],
  },
  {
    id: "enrichment_transportation_and_commute",
    category: "Enrichment",
    title: "Transportation and commute",
    fields: [
      {
        key: "enrichment_nearby_bus_stops",
        label: "Nearby bus stops",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_transit_routes",
        label: "Transit routes",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_train_skytrain_stations",
        label: "Train / SkyTrain stations",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_transit_frequency",
        label: "Transit frequency",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_walking_travel_times",
        label: "Walking travel times",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_cycling_travel_times",
        label: "Cycling travel times",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_driving_travel_times",
        label: "Driving travel times",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_commute_to_selected_destinations",
        label: "Commute to selected destinations",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_highway_access",
        label: "Highway access",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_traffic_context",
        label: "Traffic context",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_bike_lanes",
        label: "Bike lanes",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_car_share_access",
        label: "Car-share access",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_ev_charging_stations",
        label: "EV charging stations",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
    ],
    planned: [],
  },
  {
    id: "enrichment_neighborhood_and_lifestyle",
    category: "Enrichment",
    title: "Neighborhood and lifestyle",
    fields: [
      {
        key: "enrichment_nearby_parks",
        label: "Nearby parks",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_playgrounds",
        label: "Playgrounds",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_community_centres",
        label: "Community centres",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_recreation_facilities",
        label: "Recreation facilities",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_gyms",
        label: "Gyms",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_swimming_pools",
        label: "Swimming pools",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_sports_fields",
        label: "Sports fields",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_libraries",
        label: "Libraries",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_hospitals",
        label: "Hospitals",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_walk_in_clinics",
        label: "Walk-in clinics",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_community_amenities",
        label: "Community amenities",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_neighborhood_development_proposals",
        label: "Neighborhood development proposals",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_traffic_construction_noise_context",
        label: "Traffic / construction noise context",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_walkability_information",
        label: "Walkability information",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_cycling_infrastructure",
        label: "Cycling infrastructure",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
    ],
    planned: [],
  },
  {
    id: "enrichment_environmental_and_location_context",
    category: "Enrichment",
    title: "Environmental and location context",
    fields: [
      {
        key: "enrichment_floodplain_information",
        label: "Floodplain information",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_wildfire_hazard_context",
        label: "Wildfire hazard context",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_earthquake_seismic_information",
        label: "Earthquake / seismic information",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_nearby_industrial_areas",
        label: "Nearby industrial areas",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_noise_sources",
        label: "Noise sources",
        kind: "textarea",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_nearby_construction",
        label: "Nearby construction",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_slope_and_terrain",
        label: "Slope and terrain",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
      {
        key: "enrichment_sun_exposure_estimation",
        label: "Sun exposure estimation",
        kind: "text",
        hint: "Manually verified information only. Include a source and date where helpful; no live lookup is connected.",
      },
    ],
    planned: [
      {
        label: "Street View",
        description: "Street View is planned; no external maps are connected.",
      },
      {
        label: "Satellite imagery",
        description:
          "Satellite imagery is planned; no external maps are connected.",
      },
      {
        label: "Land-use / zoning maps",
        description:
          "Map integrations are planned; enter verified zoning notes under Core details.",
      },
    ],
  },
];
export const BASELINE_ROADMAP = [
  {
    title: "Interactive property experience",
    items: [
      "Interactive floor plan",
      "Room-specific clickable hotspots",
      "Photos attached to rooms",
      "3D virtual home tour",
      "360-degree panoramas",
      "Walkthrough video",
      "Interactive neighborhood map",
      "Amenity filters",
      "Travel time calculator",
      "Furniture-fit estimator",
      "Room comparison feature",
      "Visual room search",
    ],
  },
  {
    title: "AI assistant capabilities",
    items: [
      "Text-based property questions",
      "Voice-based questions",
      "Multilingual responses",
      "Suggested common questions",
      "Room-specific questions",
      "Follow-up conversations",
      "Source-backed answers",
      "Unknown-answer handling",
      "Agent escalation",
      "Question history during session",
      "Personalized property summary",
      "AI-generated property highlights",
      "Answers from approved uploaded documents",
    ],
  },
  {
    title: "Visitor engagement",
    items: [
      "Request a private showing",
      "Save favorite rooms",
      "Save questions",
      "Share property with family",
      "Download a property summary",
      "Submit property feedback",
      "Contact realtor",
      "Optional visitor registration with consent",
    ],
  },
  {
    title: "Realtor analytics and automation",
    items: [
      "Live visitor sessions",
      "Total QR scans",
      "Frequently asked questions",
      "Unanswered questions",
      "Popular amenities",
      "Visitor feedback summary",
      "Realtor notifications",
      "Open-house performance report",
      "AI-generated seller summary",
      "CRM integration",
      "Question trends across listings",
    ],
  },
];
export const BASELINE_FIELDS = BASELINE_SECTIONS.flatMap(
  (section) => section.fields,
);

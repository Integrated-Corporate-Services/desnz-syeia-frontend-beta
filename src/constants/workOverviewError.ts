export const WORKS_OVERVIEW_VALIDATION_MESSAGES = {
  // Common messages
  SELECT_YES_OR_NO: "Select 'Yes' or 'No'",
  
  // Poles section
  ADDING_OR_REPLACING_POLES_REQUIRED: "Select 'Yes' or 'No'",
  POLE_MATERIAL_REQUIRED: 'Enter a description of materials used',
  CHEMICAL_TREATMENTS_REQUIRED: 'Enter chemical treatments',
  POLES_ADDED_REQUIRED: 'Enter the number of poles to be added',
  POLES_ADDED_FORMAT: 'You can only enter letters and numbers',
  POLES_REPLACED_REQUIRED: 'Enter the number of poles to be replaced',
  POLES_REPLACED_FORMAT: 'You can only enter letters and numbers',
  POLE_COMMENTS_REQUIRED: 'Add a comment',
  TALLEST_NEW_POLE_HEIGHT_REQUIRED: 'Enter the height of the tallest new pole',
  TALLEST_NEW_POLE_HEIGHT_INVALID: 'Enter a valid height in metres',
  TALLEST_NEW_POLE_HEIGHT_NEGATIVE: 'Height must be 0 or greater',
  TALLEST_NEW_POLE_HEIGHT_TOO_LARGE: 'Height must be 9999 metres or less',
  TALLEST_NEW_POLE_HEIGHT_DECIMAL_PLACES: 'Enter height with no more than 2 decimal places',
  
  // Overhead lines section
  ADDING_OR_REPLACING_LINES_REQUIRED: "Select 'Yes' or 'No'",
  OVERHEAD_LINE_DESCRIPTION_REQUIRED: 'Enter a description of the overhead lines',
  ESTIMATED_DURATION_REQUIRED: 'Enter an estimate of the duration',
  VEHICLES_REQUIRED_REQUIRED: 'Enter a list of vehicles required on site',
  ROAD_CLOSURES_REQUIRED: "Select 'Yes' or 'No'",
  ROAD_CLOSURES_DETAILS_REQUIRED: 'Enter details of the road closures, lane closures, temporary traffic lights, road, times, duration',
  
  // Excavation section
  EXCAVATION_REQUIRED: "Select 'Yes' or 'No'",
  EXCAVATION_DETAILS_REQUIRED: 'Enter details about the excavation work',
  
  // Vegetation clearance section
  VEGETATION_CLEARANCE_REQUIRED: "Select 'Yes' or 'No'",
  VEGETATION_CLEARANCE_DETAILS_REQUIRED: 'Enter details about the vegetation clearance',
  
  // Equipment removal section
  REMOVING_EXISTING_EQUIPMENT_REQUIRED: "Select 'Yes' or 'No'",
  REMOVAL_DESCRIPTION_REQUIRED: 'Enter a description of the equipment to be removed',
} as const;
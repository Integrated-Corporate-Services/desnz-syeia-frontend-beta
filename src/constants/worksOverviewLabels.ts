/**
 * Single source of truth for Works Overview question labels (form + CYA + application summary).
 */
export const WORKS_OVERVIEW_QUESTIONS = {
  ADDING_REPLACING_POLES: 'Are you adding or replacing any poles?',
  POLE_MATERIAL: 'What materials will be used for the new poles or pylons?',
  CHEMICAL_TREATMENTS: 'Are any chemical coatings proposed?',
  POLES_ADDED: 'How many poles are you adding?',
  POLES_REPLACED: 'How many poles are you replacing?',
  POLE_COMMENTS: 'Comments on poles being added or replaced',
  TALLEST_NEW_POLE_HEIGHT: 'What height is the tallest new pole?',
  ADDING_REPLACING_LINES: 'Are you adding or replacing any overhead lines?',
  OVERHEAD_LINE_DESC: 'Provide a description of the overhead lines that you are adding or replacing',
  ESTIMATED_DURATION: 'What is the estimated duration of the works?',
  VEHICLES_REQUIRED: 'What vehicles will be required on site?',
  ROAD_CLOSURES: 'Will any road closures or traffic calming measures be required?',
  ROAD_CLOSURES_DETAILS:
    'Please provide details of the road closures, lane closures, temporary traffic lights, road, times, duration',
  ROAD_CLOSURES_DOCUMENTS: 'Upload any documents related to discussions with the highway authority.',
  EXCAVATION_REQUIRED: 'Are excavation works required?',
  EXCAVATION_DETAILS: 'Provide more details about the excavation work',
  EXCAVATION_HINT: 'For example: trenching, digging, or ground works near existing assets',
  VEGETATION_CLEARANCE: 'Is vegetation clearance required?',
  VEGETATION_DETAILS: 'Provide more details about the vegetation clearance',
  VEGETATION_HINT: 'For example: hedgerow removal or tree lopping',
  EXISTING_ACCESS_ROUTES: 'Are you using pre-existing access routes and/or storage sites?',
  ACCESS_ROUTES_DETAILS: 'Provide more details about pre-existing access routes and/or storage sites',
  PROPOSED_ACCESS_ROUTES_DETAILS: 'Provide more details about proposed access routes and/or storage sites',
  ACCESS_ROUTES_DOCUMENTS: 'Upload map and photos of the access route.',
  PROPOSED_ACCESS_ROUTES_DOCUMENTS: 'Upload map and photos of proposed routes and storage sites.',
  REMOVING_EQUIPMENT: 'Are you removing any existing equipment as part of this project?',
  REMOVAL_DESCRIPTION: 'Provide a description of the equipment you are removing',
  GENERAL_COMMENTS: 'General comments',
  GENERAL_COMMENTS_HINT:
    'Are you carrying out any additional work to any assets on this route that is not covered above?',
} as const;

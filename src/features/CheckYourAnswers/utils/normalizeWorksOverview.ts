import { WorksOverview } from '../component/ApplicationSubmit.types';

/** Coerce API/DB values to strict boolean for summary conditionals. */
export function coerceBoolean(value: unknown): boolean | undefined {
  if (value === true || value === 'true' || value === 'yes' || value === 'Yes' || value === 1 || value === '1') {
    return true;
  }
  if (value === false || value === 'false' || value === 'no' || value === 'No' || value === 0 || value === '0') {
    return false;
  }
  return undefined;
}

export function isYes(value: unknown): boolean {
  return coerceBoolean(value) === true;
}

export function isNo(value: unknown): boolean {
  return coerceBoolean(value) === false;
}

/** Normalise review API payload (camelCase or snake_case, string booleans). */
export function normalizeWorksOverview(raw: Record<string, unknown> | null | undefined): WorksOverview | null {
  if (!raw || typeof raw !== 'object') return null;

  return {
    addingOrReplacingPoles: coerceBoolean(raw.addingOrReplacingPoles ?? raw.adding_or_replacing_poles),
    poleMaterial: (raw.poleMaterial ?? raw.pole_material) as string | undefined,
    chemicalTreatments: (raw.chemicalTreatments ?? raw.chemical_treatments) as string | undefined,
    polesAdded: (raw.polesAdded ?? raw.poles_added) as number | undefined,
    polesReplaced: (raw.polesReplaced ?? raw.poles_replaced) as number | undefined,
    tallestNewPoleHeight: (raw.tallestNewPoleHeight ?? raw.tallest_new_pole_height_m ?? null) as number | null | undefined,
    poleComments: (raw.poleComments ?? raw.pole_comments) as string | undefined,
    addingOrReplacingLines: coerceBoolean(raw.addingOrReplacingLines ?? raw.adding_or_replacing_lines),
    overheadLineDescription: (raw.overheadLineDescription ?? raw.overhead_line_description) as string | undefined,
    estimatedDuration: (raw.estimatedDuration ?? raw.estimated_duration) as string | undefined,
    vehiclesRequired: (raw.vehiclesRequired ?? raw.vehicles_required) as string | undefined,
    roadClosuresRequired: coerceBoolean(raw.roadClosuresRequired ?? raw.road_closures_required),
    roadClosuresDetails: (raw.roadClosuresDetails ?? raw.road_closures_details) as string | undefined,
    excavationRequired: coerceBoolean(raw.excavationRequired ?? raw.excavation_required),
    excavationDetails: (raw.excavationDetails ?? raw.excavation_details) as string | undefined,
    vegetationClearanceRequired: coerceBoolean(raw.vegetationClearanceRequired ?? raw.vegetation_clearance_required),
    vegetationClearanceDetails: (raw.vegetationClearanceDetails ?? raw.vegetation_clearance_details) as string | undefined,
    usingExistingAccessRoutes: coerceBoolean(raw.usingExistingAccessRoutes ?? raw.using_existing_access_routes),
    accessRoutesDetails: (raw.accessRoutesDetails ?? raw.access_routes_details) as string | undefined,
    removingExistingEquipment: coerceBoolean(raw.removingExistingEquipment ?? raw.removing_existing_equipment),
    removalDescription: (raw.removalDescription ?? raw.removal_description) as string | undefined,
    generalComments: (raw.generalComments ?? raw.general_comments) as string | undefined,
    applicationDocuments: (raw.applicationDocuments ?? raw.application_documents) as WorksOverview['applicationDocuments'],
  };
}

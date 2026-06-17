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

  const nested =
    raw.worksOverview && typeof raw.worksOverview === 'object'
      ? (raw.worksOverview as Record<string, unknown>)
      : null;
  const source = nested ? { ...raw, ...nested } : raw;
  return {
    addingOrReplacingPoles: coerceBoolean(source.addingOrReplacingPoles ?? source.adding_or_replacing_poles),
    poleMaterial: (source.poleMaterial ?? source.pole_material) as string | undefined,
    chemicalTreatments: (source.chemicalTreatments ?? source.chemical_treatments) as string | undefined,
    polesAdded: (source.polesAdded ?? source.poles_added) as number | undefined,
    polesReplaced: (source.polesReplaced ?? source.poles_replaced) as number | undefined,
    tallestNewPoleHeight: (source.tallestNewPoleHeight ?? source.tallest_new_pole_height_m ?? null) as number | null | undefined,
    poleComments: (source.poleComments ?? source.pole_comments) as string | undefined,
    addingOrReplacingLines: coerceBoolean(source.addingOrReplacingLines ?? source.adding_or_replacing_lines),
    overheadLineDescription: (source.overheadLineDescription ?? source.overhead_line_description) as string | undefined,
    estimatedDuration: (source.estimatedDuration ?? source.estimated_duration) as string | undefined,
    vehiclesRequired: (source.vehiclesRequired ?? source.vehicles_required) as string | undefined,
    roadClosuresRequired: coerceBoolean(source.roadClosuresRequired ?? source.road_closures_required),
    roadClosuresDetails: (source.roadClosuresDetails ?? source.road_closures_details) as string | undefined,
    excavationRequired: coerceBoolean(source.excavationRequired ?? source.excavation_required),
    excavationDetails: (source.excavationDetails ?? source.excavation_details) as string | undefined,
    vegetationClearanceRequired: coerceBoolean(source.vegetationClearanceRequired ?? source.vegetation_clearance_required),
    vegetationClearanceDetails: (source.vegetationClearanceDetails ?? source.vegetation_clearance_details) as string | undefined,
    usingExistingAccessRoutes: coerceBoolean(source.usingExistingAccessRoutes ?? source.using_existing_access_routes),
    accessRoutesDetails: (source.accessRoutesDetails ?? source.access_routes_details) as string | undefined,
    removingExistingEquipment: coerceBoolean(source.removingExistingEquipment ?? source.removing_existing_equipment),
    removalDescription: (source.removalDescription ?? source.removal_description) as string | undefined,
    generalComments: (source.generalComments ?? source.general_comments) as string | undefined,
    applicationDocuments: (source.applicationDocuments ?? source.application_documents) as WorksOverview['applicationDocuments'],
  };
}

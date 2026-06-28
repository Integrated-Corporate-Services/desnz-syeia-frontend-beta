import { WorksOverviewRequest } from '../../../types/works';

type WorksOverviewForm = {
  addingOrReplacingPoles: string;
  poleMaterial: string;
  chemicalTreatments: string;
  polesAdded: string;
  polesReplaced: string;
  tallestNewPoleHeight: string;
  poleComments: string;
  addingOrReplacingLines: string;
  overheadLineDescription: string;
  estimatedDuration: string;
  vehiclesRequired: string;
  roadClosuresRequired: string;
  roadClosuresDetails: string;
  excavationRequired: string;
  excavationDetails: string;
  vegetationClearanceRequired: string;
  vegetationClearanceDetails: string;
  removingExistingEquipment: string;
  removalDescription: string;
  generalComments: string;
};

/** Map form state to API payload, clearing fields hidden by No answers. */
export function buildWorksOverviewPayload(
  form: WorksOverviewForm,
  applicationId: string,
): WorksOverviewRequest {
  const addingPoles = form.addingOrReplacingPoles === 'yes';
  const addingLines = form.addingOrReplacingLines === 'yes';
  const roadClosures = form.roadClosuresRequired === 'yes';
  const excavation = form.excavationRequired === 'yes';
  const vegetation = form.vegetationClearanceRequired === 'yes';
  const removingEquipment = form.removingExistingEquipment === 'yes';

  return {
    applicationId,
    worksOverview: {
      addingOrReplacingPoles: addingPoles,
      addingOrReplacingLines: addingLines,
      poleMaterial: addingPoles ? form.poleMaterial : '',
      chemicalTreatments: addingPoles ? form.chemicalTreatments : '',
      polesAdded: addingPoles ? parseInt(form.polesAdded, 10) || 0 : 0,
      polesReplaced: addingPoles ? parseInt(form.polesReplaced, 10) || 0 : 0,
      tallestNewPoleHeight: addingPoles ? parseFloat(form.tallestNewPoleHeight) || 0 : null,
      poleComments: addingPoles ? form.poleComments : '',
      overheadLineDescription: addingLines ? form.overheadLineDescription : '',
      estimatedDuration: form.estimatedDuration || '',
      vehiclesRequired: form.vehiclesRequired || '',
      roadClosuresRequired: roadClosures,
      roadClosuresDetails: roadClosures ? form.roadClosuresDetails : '',
      excavationRequired: excavation,
      excavationDetails: excavation ? form.excavationDetails : '',
      vegetationClearanceRequired: vegetation,
      vegetationClearanceDetails: vegetation ? form.vegetationClearanceDetails : '',
      removingExistingEquipment: removingEquipment,
      removalDescription: removingEquipment ? form.removalDescription : '',
      generalComments: form.generalComments || '',
    },
  };
}

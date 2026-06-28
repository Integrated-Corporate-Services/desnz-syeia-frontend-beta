// Types for WorksOverview asset payload
export interface WorksOverviewPoles {
	hasAddOrReplace: boolean;
	poleMaterial: string;
	chemicalTreatments: string;
	add: number;
	replace: number;
	description: string;
}

export interface FileUpload {
	url: string;
	name: string;
	size: number;
}

export interface WorksOverviewOverheadLines {
	hasAddOrReplace: boolean;
	description: string;
    estimatedDuration: string;
    vehiclesRequired: string;
    roadClosuresRequired: string;
}

export interface WorksOverviewEquipmentRemoval {
	isRemoving: boolean;
	description: string;
}

export interface WorksOverviewAsset {
	addingOrReplacingPoles: boolean;
	poleMaterial: string;
	chemicalTreatments: string;
	polesAdded: number;
	polesReplaced: number;
	tallestNewPoleHeight?: number | null;
	poleComments: string;
	addingOrReplacingLines: boolean;
	overheadLineDescription: string;
	estimatedDuration: string;
	vehiclesRequired: string;
	roadClosuresRequired: boolean;
	roadClosuresDetails: string;
	excavationRequired: boolean;
	excavationDetails: string;
	vegetationClearanceRequired: boolean;
	vegetationClearanceDetails: string;
	removingExistingEquipment: boolean;
	removalDescription: string;
	generalComments: string;
}

export interface WorksOverviewRequest {
	applicationId: string;
	worksOverview: WorksOverviewAsset;
}

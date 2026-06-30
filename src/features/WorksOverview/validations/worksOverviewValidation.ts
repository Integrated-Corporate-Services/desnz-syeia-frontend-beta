/**
 * Works Overview Form - Validation Logic
 */

import { ValidationError, WORKS_OVERVIEW_VALIDATION_MESSAGES } from './worksOverviewErrors';

export interface WorksOverviewFormData {
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
}

const isWholeNumber = (value: string) => /^\d+$/.test(value.trim());

/**
 * Validates all Works Overview form fields
 */
export const validateWorksOverviewForm = (data: WorksOverviewFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.addingOrReplacingPoles) {
        errors.push({
            field: 'addingOrReplacingPoles',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.ADDING_OR_REPLACING_POLES_REQUIRED,
        });
    } else if (data.addingOrReplacingPoles === 'yes') {
        if (!data.poleMaterial.trim()) {
            errors.push({ field: 'poleMaterial', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.POLE_MATERIAL_REQUIRED });
        }
        if (!data.chemicalTreatments.trim()) {
            errors.push({ field: 'chemicalTreatments', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.CHEMICAL_TREATMENTS_REQUIRED });
        }
        if (!data.polesAdded.trim()) {
            errors.push({ field: 'polesAdded', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.POLES_ADDED_REQUIRED });
        } else if (!isWholeNumber(data.polesAdded)) {
            errors.push({ field: 'polesAdded', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.POLES_ADDED_FORMAT });
        }
        if (!data.polesReplaced.trim()) {
            errors.push({ field: 'polesReplaced', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.POLES_REPLACED_REQUIRED });
        } else if (!isWholeNumber(data.polesReplaced)) {
            errors.push({ field: 'polesReplaced', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.POLES_REPLACED_FORMAT });
        }
        if (!data.tallestNewPoleHeight.trim()) {
            errors.push({
                field: 'tallestNewPoleHeight',
                message: WORKS_OVERVIEW_VALIDATION_MESSAGES.TALLEST_NEW_POLE_HEIGHT_REQUIRED,
            });
        } else {
            const height = Number(data.tallestNewPoleHeight.trim());
            if (Number.isNaN(height)) {
                errors.push({
                    field: 'tallestNewPoleHeight',
                    message: WORKS_OVERVIEW_VALIDATION_MESSAGES.TALLEST_NEW_POLE_HEIGHT_INVALID,
                });
            } else if (height < 0) {
                errors.push({
                    field: 'tallestNewPoleHeight',
                    message: WORKS_OVERVIEW_VALIDATION_MESSAGES.TALLEST_NEW_POLE_HEIGHT_NEGATIVE,
                });
            }
        }
    }

    if (!data.addingOrReplacingLines) {
        errors.push({
            field: 'addingOrReplacingLines',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.ADDING_OR_REPLACING_LINES_REQUIRED,
        });
    } else if (data.addingOrReplacingLines === 'yes' && !data.overheadLineDescription.trim()) {
        errors.push({
            field: 'overheadLineDescription',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.OVERHEAD_LINE_DESCRIPTION_REQUIRED,
        });
    }

    if (!data.estimatedDuration.trim()) {
        errors.push({ field: 'estimatedDuration', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.ESTIMATED_DURATION_REQUIRED });
    }
    if (!data.vehiclesRequired.trim()) {
        errors.push({ field: 'vehiclesRequired', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.VEHICLES_REQUIRED_REQUIRED });
    }

    if (!data.roadClosuresRequired) {
        errors.push({ field: 'roadClosuresRequired', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.ROAD_CLOSURES_REQUIRED });
    } else if (data.roadClosuresRequired === 'yes' && !data.roadClosuresDetails.trim()) {
        errors.push({
            field: 'roadClosuresDetails',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.ROAD_CLOSURES_DETAILS_REQUIRED,
        });
    }

    if (!data.excavationRequired) {
        errors.push({ field: 'excavationRequired', message: WORKS_OVERVIEW_VALIDATION_MESSAGES.EXCAVATION_REQUIRED });
    } else if (data.excavationRequired === 'yes' && !data.excavationDetails.trim()) {
        errors.push({
            field: 'excavationDetails',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.EXCAVATION_DETAILS_REQUIRED,
        });
    }

    if (!data.vegetationClearanceRequired) {
        errors.push({
            field: 'vegetationClearanceRequired',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.VEGETATION_CLEARANCE_REQUIRED,
        });
    } else if (data.vegetationClearanceRequired === 'yes' && !data.vegetationClearanceDetails.trim()) {
        errors.push({
            field: 'vegetationClearanceDetails',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.VEGETATION_CLEARANCE_DETAILS_REQUIRED,
        });
    }

    if (!data.removingExistingEquipment) {
        errors.push({
            field: 'removingExistingEquipment',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.REMOVING_EXISTING_EQUIPMENT_REQUIRED,
        });
    } else if (data.removingExistingEquipment === 'yes' && !data.removalDescription.trim()) {
        errors.push({
            field: 'removalDescription',
            message: WORKS_OVERVIEW_VALIDATION_MESSAGES.REMOVAL_DESCRIPTION_REQUIRED,
        });
    }

    return errors;
};

export const hasFieldError = (field: string, errors: ValidationError[]): boolean => {
    return errors.some((err) => err.field === field);
};

export const getFieldErrorMessage = (field: string, errors: ValidationError[]): string => {
    const error = errors.find((e) => e.field === field);
    return error ? error.message : '';
};

export const clearValidationErrors = (): ValidationError[] => {
    return [];
};

export const clearFieldValidationErrors = (
    errors: ValidationError[],
    fields: string[]
): ValidationError[] => {
    const fieldSet = new Set(fields);
    if (!errors.some((err) => fieldSet.has(err.field))) {
        return errors;
    }
    return errors.filter((err) => !fieldSet.has(err.field));
};

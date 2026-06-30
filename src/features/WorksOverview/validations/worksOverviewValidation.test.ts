import { describe, expect, it } from 'vitest';
import { validateWorksOverviewForm, clearFieldValidationErrors } from './worksOverviewValidation';
import { WORKS_OVERVIEW_VALIDATION_MESSAGES } from './worksOverviewErrors';

const emptyForm = {
    addingOrReplacingPoles: '',
    poleMaterial: '',
    chemicalTreatments: '',
    polesAdded: '',
    polesReplaced: '',
    tallestNewPoleHeight: '',
    poleComments: '',
    addingOrReplacingLines: '',
    overheadLineDescription: '',
    estimatedDuration: '',
    vehiclesRequired: '',
    roadClosuresRequired: '',
    roadClosuresDetails: '',
    excavationRequired: '',
    excavationDetails: '',
    vegetationClearanceRequired: '',
    vegetationClearanceDetails: '',
    removingExistingEquipment: '',
    removalDescription: '',
};

describe('worksOverviewValidation', () => {
    it('returns required errors for empty form', () => {
        const errors = validateWorksOverviewForm(emptyForm);
        expect(errors.some((err) => err.field === 'addingOrReplacingPoles')).toBe(true);
        expect(errors.some((err) => err.message === WORKS_OVERVIEW_VALIDATION_MESSAGES.ADDING_OR_REPLACING_POLES_REQUIRED)).toBe(true);
    });

    it('returns pole field errors when adding poles is yes', () => {
        const errors = validateWorksOverviewForm({
            ...emptyForm,
            addingOrReplacingPoles: 'yes',
        });
        expect(errors.some((err) => err.field === 'poleMaterial')).toBe(true);
    });

    it('clears only specified field errors', () => {
        const errors = [
            { field: 'addingOrReplacingPoles', message: 'Select yes or no' },
            { field: 'addingOrReplacingLines', message: 'Select yes or no' },
        ];

        const cleared = clearFieldValidationErrors(errors, ['addingOrReplacingPoles']);

        expect(cleared).toHaveLength(1);
        expect(cleared[0].field).toBe('addingOrReplacingLines');
    });
});

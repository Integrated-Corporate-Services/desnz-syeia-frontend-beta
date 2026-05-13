import { registerCheckYourAnswersCards } from '../utils/checkYourAnswersCardMapper';

export const registerAllApplicationTypes = () => {
    registerCheckYourAnswersCards('NWL', async () => {
        const { getNWLCheckYourAnswersCards } = await import('../../NWL/ApplicationSummary/checkYourAnswersCardsConfig');
        return getNWLCheckYourAnswersCards();
    });

    registerCheckYourAnswersCards('S37', async () => {
        console.warn('S37 CheckYourAnswers cards not yet registered');
        return {} as any;
    });

    registerCheckYourAnswersCards('TLP', async () => {
        console.warn('TLP CheckYourAnswers cards not yet registered');
        return {} as any;
    });
};

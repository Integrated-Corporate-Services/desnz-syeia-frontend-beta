import { registerCheckYourAnswersCards } from '../utils/checkYourAnswersCardMapper';

export const registerAllApplicationTypes = () => {
    registerCheckYourAnswersCards('NWL', async () => {
        const { getNWLCheckYourAnswersCards } = await import('../../NWL/ApplicationSummary/checkYourAnswersCardsConfig');
        return getNWLCheckYourAnswersCards();
    });

    registerCheckYourAnswersCards('S37', async () => {
        return {} as any;
    });

    registerCheckYourAnswersCards('TLP', async () => {
        return {} as any;
    });
};

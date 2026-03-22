import { Unit3DClassicEngine } from '../templates/unit3d_classic';
import { ClassicTypeSelectionContext } from '../templates/unit3d';
import { getSizeFromDescr } from '../common/rules/helpers';

export class ACMEngine extends Unit3DClassicEngine {
    protected applyClassicSiteTypeSelection(ctx: ClassicTypeSelectionContext): boolean {
        const { medium, standard, titleBlob, descrBlob, setAutoTypeValue } = ctx;
        const discSize = (medium === 'Blu-ray' || medium === 'UHD') ? getSizeFromDescr(descrBlob) : 0;

        if (medium === 'UHD') {
            if (/remux/i.test(titleBlob)) {
                setAutoTypeValue('12');
            } else if (0 <= discSize && discSize < 46.57) {
                setAutoTypeValue('3');
            } else if (discSize < 61.47) {
                setAutoTypeValue('2');
            } else {
                setAutoTypeValue('1');
            }
        } else if (medium === 'Blu-ray') {
            if (0 <= discSize && discSize < 23.28) setAutoTypeValue('5');
            else if (discSize < 46.57) setAutoTypeValue('4');
        } else if (medium === 'Remux') {
            setAutoTypeValue('7');
        } else if (medium === 'HDTV') {
            setAutoTypeValue('17');
        } else if (medium === 'Encode') {
            if (standard === '4K') setAutoTypeValue('8');
            else if (standard === '1080p' || standard === '1080i') setAutoTypeValue('10');
            else if (standard === '720p') setAutoTypeValue('11');
            else if (standard === 'SD') setAutoTypeValue('13');
        } else if (medium === 'DVD') {
            setAutoTypeValue(/dvd5/i.test(titleBlob) ? '14' : '16');
        } else if (medium === 'WEB-DL') {
            setAutoTypeValue('9');
        }

        if (/webrip/i.test(titleBlob)) {
            setAutoTypeValue('9');
        }

        return true;
    }

    protected getClassicAutoResolutionMap(): Record<string, number> {
        return { '4K': 1, '1080p': 2, '1080i': 2, '720p': 3, SD: 4, '': 0, '8K': 0 };
    }
}

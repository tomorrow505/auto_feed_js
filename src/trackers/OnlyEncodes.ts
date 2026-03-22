import { Unit3DClassicEngine } from '../templates/unit3d_classic';
import { ClassicTypeSelectionContext } from '../templates/unit3d';

export class OnlyEncodesEngine extends Unit3DClassicEngine {
    protected applyClassicSiteTypeSelection(ctx: ClassicTypeSelectionContext): boolean {
        const { medium, meta, setSelectIndex, typeId } = ctx;

        // Legacy index mapping for OnlyEncodes.
        if (medium === 'UHD' || medium === 'Blu-ray') {
            setSelectIndex(typeId, 4);
        } else if (medium === 'Remux') {
            setSelectIndex(typeId, 5);
        } else if (medium === 'HDTV') {
            setSelectIndex(typeId, 6);
        } else if (medium === 'Encode') {
            if (meta.codecSel === 'X264' || meta.codecSel === 'H264') setSelectIndex(typeId, 2);
            else setSelectIndex(typeId, 1);
        } else if (medium === 'WEB-DL') {
            setSelectIndex(typeId, 6);
        }

        return true;
    }
}

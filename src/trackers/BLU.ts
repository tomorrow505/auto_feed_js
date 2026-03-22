import { Unit3DClassicEngine } from '../templates/unit3d_classic';

export class BLUEngine extends Unit3DClassicEngine {
    protected getClassicAutoResolutionMap(): Record<string, number> {
        return { '4K': 1, '1080p': 2, '1080i': 3, '720p': 5, SD: 0, '': 0, '8K': 11 };
    }

    protected getClassicResolutionFallbackMap(): Record<string, number> {
        return { '4K': 1, '1080p': 2, '1080i': 3, '720p': 5, SD: 0, '8K': 11 };
    }
}

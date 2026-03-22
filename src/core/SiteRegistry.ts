
import { BaseEngine } from './BaseEngine';
import { SiteConfig, SiteType } from '../types/SiteConfig';
import { NexusPHPEngine } from '../trackers/NexusPHP';
import { GazelleEngine } from '../trackers/Gazelle';
import { Unit3DEngine } from '../templates/unit3d';
import { Unit3DClassicEngine } from '../templates/unit3d_classic';
import { MTeamEngine } from '../trackers/MTeam';
import { CHDBitsEngine } from '../trackers/CHDBits';
import { BHDEngine } from '../trackers/BHD';
import { PTPEngine } from '../trackers/PTP';
import { HDBEngine } from '../trackers/HDB';
import { KGEngine } from '../trackers/KG';
import { TTGEngine } from '../trackers/TTG';
import { GPWEngine } from '../trackers/GPW';
import { REDEngine } from '../trackers/RED';
import { OPSEngine } from '../trackers/OPS';
import { DICEngine } from '../trackers/DIC';
import { OpenCDEngine } from '../trackers/OpenCD';
import { TikEngine } from '../trackers/Tik';
import { ACMEngine } from '../trackers/ACM';
import { BLUEngine } from '../trackers/BLU';
import { MonikaEngine } from '../trackers/Monika';
import { OnlyEncodesEngine } from '../trackers/OnlyEncodes';
import { CMCTEngine } from '../trackers/nexus/CMCT';
import { HDSkyEngine } from '../trackers/nexus/HDSky';
import { PTerEngine } from '../trackers/nexus/PTer';
import { AudiencesEngine } from '../trackers/nexus/Audiences';
import { HDHomeEngine } from '../trackers/nexus/HDHome';
import { OurBitsEngine } from '../trackers/nexus/OurBits';
import { FRDSEngine } from '../trackers/nexus/FRDS';
import { NexusSites } from '../config/sites_nexus';
import { GazelleSites } from '../config/sites_gazelle';
import { Unit3DSites } from '../config/sites_unit3d';

// Registries for configs
const siteConfigs: SiteConfig[] = [
    ...NexusSites,
    ...GazelleSites,
    ...Unit3DSites
];

// Registry for Engine definitions (Classes)
const engineMap: Record<string, new (config: SiteConfig, url: string) => BaseEngine> = {
    [SiteType.NexusPHP]: NexusPHPEngine,
    [SiteType.Gazelle]: GazelleEngine,
    [SiteType.Unit3D]: Unit3DEngine,
    [SiteType.Unit3DClassic]: Unit3DClassicEngine,
    [SiteType.MTeam]: MTeamEngine,
    [SiteType.CHDBits]: CHDBitsEngine,
    [SiteType.BHD]: BHDEngine,
    [SiteType.PTP]: PTPEngine,
    [SiteType.HDB]: HDBEngine,
    [SiteType.KG]: KGEngine
};

// Site-specific engines override framework-level engines.
// Keep one-file-per-site mapping here so site behaviors do not leak into framework templates.
const siteEngineMap: Record<string, new (config: SiteConfig, url: string) => BaseEngine> = {
    ACM: ACMEngine,
    Audiences: AudiencesEngine,
    CHDBits: CHDBitsEngine,
    BLU: BLUEngine,
    CMCT: CMCTEngine,
    FRDS: FRDSEngine,
    HDB: HDBEngine,
    HDHome: HDHomeEngine,
    HDSky: HDSkyEngine,
    KG: KGEngine,
    MTeam: MTeamEngine,
    Monika: MonikaEngine,
    OpenCD: OpenCDEngine,
    OnlyEncodes: OnlyEncodesEngine,
    OurBits: OurBitsEngine,
    PTP: PTPEngine,
    PTer: PTerEngine,
    TTG: TTGEngine,
    GPW: GPWEngine,
    RED: REDEngine,
    OPS: OPSEngine,
    DIC: DICEngine,
    Tik: TikEngine
};

export class SiteRegistry {

    static registerConfig(config: SiteConfig) {
        siteConfigs.push(config);
    }

    static registerEngine(type: SiteType, engineClass: new (config: SiteConfig, url: string) => BaseEngine) {
        engineMap[type] = engineClass;
    }

    static getEngine(url: string): BaseEngine | null {
        // 1. Find matching config
        const config = this.matchConfig(url);
        if (!config) return null;

        // 2. Find matching engine class (site-specific first, then framework type)
        const EngineClass = siteEngineMap[config.name] || engineMap[config.type];
        if (!EngineClass) {
            console.error(`[Auto-Feed] No engine registered for type: ${config.type}`);
            return null;
        }

        return new EngineClass(config, url);
    }

    private static matchConfig(url: string): SiteConfig | null {
        for (const config of siteConfigs) {
            // Check keywords/domains first (fast)
            if (config.keywords.some(k => url.includes(k))) {
                return config;
            }
            // Check regex if defined
            if (config.match?.source?.some(r => r.test(url))) return config;
            if (config.match?.target?.some(r => r.test(url))) return config;
        }
        return null;
    }
}

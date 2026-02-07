
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

        // 2. Find matching engine class
        const EngineClass = engineMap[config.type];
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

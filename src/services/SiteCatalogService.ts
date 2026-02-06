import { SiteConfig } from '../types/SiteConfig';
import { NexusSites } from '../config/sites_nexus';
import { GazelleSites } from '../config/sites_gazelle';
import { Unit3DSites } from '../config/sites_unit3d';

export class SiteCatalogService {
    static getAllSites(): SiteConfig[] {
        return [...NexusSites, ...GazelleSites, ...Unit3DSites];
    }

    static getAllSiteNames(): string[] {
        return this.getAllSites().map((s) => s.name);
    }

    static getDefaultEnabledSiteNames(): string[] {
        // Default to all implemented sites; user can uncheck in settings.
        return this.getAllSiteNames();
    }
}

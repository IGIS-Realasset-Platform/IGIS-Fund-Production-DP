import {
    IOTA_WORKSPACES,
    normalizeIotaOrganization,
    normalizeIotaWorkspaceCode,
} from '../../utils/iotaOrganizations.js';

export const MOBILE_WORKSPACES = IOTA_WORKSPACES;

export function getInitialWorkspace(memberInfo) {
    const defaultWorkspace = MOBILE_WORKSPACES.find(w => w.code === 'WS_SSC') || MOBILE_WORKSPACES[0];
    if (!memberInfo) return defaultWorkspace;
    
    if (memberInfo.workspace_code) {
        const code = normalizeIotaWorkspaceCode(
            memberInfo.workspace_code,
            memberInfo.staff_name || memberInfo.name,
        );
        const found = MOBILE_WORKSPACES.find(w => w.code === code);
        if (found) return found;
    }
    
    if (memberInfo.org_name) {
        const organization = normalizeIotaOrganization(memberInfo.org_name);
        const found = MOBILE_WORKSPACES.find(w => w.orgNames.includes(organization));
        if (found) return found;
    }
    
    return defaultWorkspace;
}

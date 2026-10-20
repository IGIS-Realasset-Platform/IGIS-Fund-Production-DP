import {runMaintenance} from '../server/maintenance-runtime.mjs';
export const maxDuration=300;
export const GET=request=>runMaintenance(request);

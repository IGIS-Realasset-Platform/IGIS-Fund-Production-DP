import {runWorkspaceRequest} from '../server/workspace-runtime.mjs';
import {createLawRouter} from '../server/law-router.mjs';
const run=createLawRouter(runWorkspaceRequest);
export const GET=request=>run(request);
export const POST=request=>run(request);

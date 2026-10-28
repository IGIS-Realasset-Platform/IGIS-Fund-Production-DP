import {runWorkspaceRequest} from '../server/workspace-runtime.mjs';
import {createReferenceRouter} from '../server/reference-router.mjs';
const run=createReferenceRouter(runWorkspaceRequest);
export const GET=request=>run(request);
export const POST=request=>run(request);
export const PATCH=request=>run(request);

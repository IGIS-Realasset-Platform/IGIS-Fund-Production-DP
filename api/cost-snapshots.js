import {runWorkspaceRequest} from '../server/workspace-runtime.mjs';
export const GET=request=>runWorkspaceRequest(request,'costSnapshots');
export const POST=request=>runWorkspaceRequest(request,'costSnapshots');

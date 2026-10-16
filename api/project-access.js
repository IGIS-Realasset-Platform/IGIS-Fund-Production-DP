import {runWorkspaceRequest} from '../server/workspace-runtime.mjs';
export const GET=request=>runWorkspaceRequest(request,'projectAccess');
export const PUT=request=>runWorkspaceRequest(request,'projectAccess');
export const DELETE=request=>runWorkspaceRequest(request,'projectAccess');

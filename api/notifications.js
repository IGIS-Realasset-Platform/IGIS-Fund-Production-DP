import {runWorkspaceRequest} from '../server/workspace-runtime.mjs';
export const GET=request=>runWorkspaceRequest(request,'notifications');
export const PATCH=request=>runWorkspaceRequest(request,'notifications');

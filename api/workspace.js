import {runWorkspaceRequest} from '../server/workspace-runtime.mjs';
export const GET=request=>runWorkspaceRequest(request,'workspace');
export const PUT=request=>runWorkspaceRequest(request,'workspace');

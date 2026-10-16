import {runWorkspaceRequest} from '../server/workspace-runtime.mjs';
export const GET=request=>runWorkspaceRequest(request,'notionSource');

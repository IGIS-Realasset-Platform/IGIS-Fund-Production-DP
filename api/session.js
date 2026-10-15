import {runEmailAuth} from '../server/email-auth-runtime.mjs';
export const GET=request=>runEmailAuth(request,'session');
export const DELETE=request=>runEmailAuth(request,'session');

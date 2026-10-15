import {runEmailAuth} from '../server/email-auth-runtime.mjs';
export const POST=request=>runEmailAuth(request,'verify');

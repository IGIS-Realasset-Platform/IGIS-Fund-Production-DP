import fs from 'node:fs';
export function permitDomainBundle(){const source=fs.readFileSync('shared/permit-domain.mjs','utf8').replace(/^export /gm,'');return '(function(A){\n'+source+'\nA.permitDomain={permitDomainVersion,isPermitDate,requiredPermitDates,permitPredecessors,validatePermitRecord,validatePermitRoundChange,validatePermitChanges};\n})(App);';}

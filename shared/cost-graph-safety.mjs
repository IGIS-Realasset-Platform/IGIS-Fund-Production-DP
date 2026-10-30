// Relational parentId links are flat JSON, so the JSON depth guard alone cannot
// bound recursive amount consumers. Match its existing safety depth, not row count.
export const MAX_COST_GRAPH_DEPTH=100;
function topology(rows,{liveOnly=false}={}){return new Map((rows||[]).filter(row=>!liveOnly||!row.deletedAt).map(row=>[row.id,row.parentId??null]));}
function sameTopology(a,b){if(a.size!==b.size)return false;for(const[id,parent]of a)if(!b.has(id)||b.get(id)!==parent)return false;return true;}
function affectedTopology(before,after){
 const children=new Map();for(const[id,parent]of after)if(after.has(parent)){const set=children.get(parent)||[];set.push(id);children.set(parent,set);}
 const pending=[...after.keys()].filter(id=>!before.has(id)||before.get(id)!==after.get(id)),seen=new Set();
 while(pending.length){const id=pending.pop();if(seen.has(id))continue;seen.add(id);const parent=after.get(id);if(after.has(parent))pending.push(parent);for(const child of children.get(id)||[])pending.push(child);}
 return new Map([...seen].map(id=>[id,after.get(id)]));
}
function graphError(parents){
 const depths=new Map();
 for(const id of parents.keys()){
  if(depths.has(id))continue;const path=[],seen=new Set();let cursor=id;
  while(parents.has(cursor)&&!depths.has(cursor)){
   if(seen.has(cursor))return '사업비 항목의 상하위 연결이 순환합니다.';
   seen.add(cursor);path.push(cursor);if(path.length>MAX_COST_GRAPH_DEPTH)return '사업비 항목의 상하위 연결이 안전한 처리 깊이를 초과했습니다.';cursor=parents.get(cursor);
  }
  let depth=depths.get(cursor)||0;while(path.length){const node=path.pop();depth++;if(depth>MAX_COST_GRAPH_DEPTH)return '사업비 항목의 상하위 연결이 안전한 처리 깊이를 초과했습니다.';depths.set(node,depth);}
 }
 return null;
}
// Do not rewrite or retroactively reject unchanged ambiguous historical links.
// A new graph or changed link set must be safe before workspace/audit writes.
export function costGraphTransitionErrors(current,next){
 const oldProjects=new Map((current.projects||[]).map(p=>[p.id,p])),errors=[];
 function inspect(before,after,projectId,stageId,liveOnly){const prior=topology(before,{liveOnly}),following=topology(after,{liveOnly});if(sameTopology(prior,following))return;const message=graphError(affectedTopology(prior,following));if(message)errors.push({projectId,stageId,message});}
 for(const project of next.projects||[]){const old=oldProjects.get(project.id);inspect(old?.cbs,project.cbs,project.id,null,true);const oldStages=new Map((old?.costStages||[]).map(stage=>[stage.id,stage]));for(const stage of project.costStages||[])inspect(oldStages.get(stage.id)?.nodes,stage.nodes,project.id,stage.id,false);}
 return errors;
}

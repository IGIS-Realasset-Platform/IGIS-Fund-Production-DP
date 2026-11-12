// This preview has no external directory, ranking publication, legal search, or
// regional law service. Unavailable routes fall through to LOCAL_PREVIEW_ONLY;
// never invent employees, companies, official search results, or review records.
export function auxiliaryRead(pathname, params) {
  switch (pathname) {
    case '/api/notion-source': return {available:false};
    case '/api/notifications':
      // The client also reads notices already stored in the workspace. There is
      // no separate local notification inbox or read-state service.
      return {states:[], tasks:[], alerts:[]};
    case '/api/report-archives':
      // Workspace reportSnapshots/reports remain visible through the app. The
      // separate archive store is not copied, so it has no local entries.
      return params.has('id') ? undefined : {snapshots:[]};
    case '/api/cost-snapshots':
      return params.has('id') ? undefined : {snapshots:[], tasks:[]};
    default: return undefined;
  }
}

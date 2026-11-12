// Bundle the source board with local data and navigation. No source server,
// application credentials or dependencies are needed to serve the output.
import {createRequire} from 'node:module';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {basename, dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyFeedPresentation} from './presentation.mjs';

if (!process.argv[2]) throw Error('사용법: node scripts/local-preview/feed/build.mjs <원본 저장소 경로>');
const source = resolve(process.argv[2]);
const local = dirname(fileURLToPath(import.meta.url));
const output = resolve(local, '../../../.build/local-preview/work-feed');
const requireSource = createRequire(join(source, 'package.json'));
const {build} = requireSource('esbuild');
const {compile, optimize} = requireSource('@tailwindcss/node');
const {Scanner} = requireSource('@tailwindcss/oxide');
const inputs = [];
const aliases = {
    'local-feed-seed': resolve(output, '../work-feed-seed.mjs'),
    'source-feed-page': join(source, 'src/components/system/WorkFeedPage.jsx'),
    'source-feed-definitions': join(source, 'src/utils/workFeeds.js'),
    'local-feed-visuals': join(local, 'visuals.jsx'),
    'local-feed-projects': join(local, 'projects.jsx'),
    AuthContext: join(local, 'adapter.js'),
    supabaseClient: join(local, 'adapter.js'),
    workspaceDirectoryCache: join(local, 'adapter.js'),
    workFeedLocation: join(local, 'location.js'),
    profileImage: join(local, 'profile.js'),
};
const palette = {
    bg: {
        '1a1a1a 1b1b1b 1c1c1c 1c1c1e 1e293b 1f1f1e 202020 252525 262626 27272a': 'ffffff',
        '222 232323 29292b 2a2a2a 2a2a2c 2b2d2f 2c2c2e 303030': 'f0f2f6',
        '333 343434 363636 3c3c3c 444 5d5d5d': 'e8ebf1',
        '24313b 293740 35434b': 'e9edf8',
        '0071e3 0a84ff 2997ff 2b8de4 2c7eb6 3279b4': '253985',
        '3e89c6 4b9bd9': '1e306e',
    },
    border: {
        '222 2c2c2e 333 334155 343434 363636 383838 393939 3a3a3a 3a3a3c 3c3c3c 3d3d3d 3e3e3e 3f3f46 414141 444 454545 45484b 464646 484848 494949 555 666 888': 'dce0e8',
        '0a84ff 296da8 2997ff 3e566b 418dcc 4b5965 4b9bd9 4c8bbd 4f89b7 526c7d 6f9fc7 83adb5': '253985',
    },
    text: {
        '555 666 686868 737373 777 85858b 86868b 888 8e8e93 8f8d87 8f8f94 939398 999 a1a1aa a6aaae aaa bbb9af bbb bdbba7 c0c7d1 ccc': '626b7a',
        'b8b8bd c7c7cc d1d1d6 d4d4d8 d5d5d7 d8d8d4 ddd e2e8f0 e5e5e5 ededed eee': '1d1d1f',
        '0a84ff 2997ff 3b82f6 5ac8fa 60a5fa 78add6 79b7e8 7cc0ff 7eb6e1 7fc5ee 82afb9 8eb8dc 9ab8b1 9bc3df 9fd2ff a1c9e4 a5c9e5 b7d7f2 bcdbdb bdd9e8 c7e1ee': '253985',
        '30d158 34d399 4ade80 86b79c a1cbb4': '26724c',
        'bd716d cc8580 d1a5a5 dd8b86 de827e df7f7a df827e e17f79 ef4444 ff3b30 ff453a ff8179': 'b42630',
        'd4bd94 e2aa29 fbf167 ff9f0a': '7d551c',
        'bf5af2 c5b4df': '644285',
    },
    outline: {'78add6': '253985'},
    ring: {'86868b': 'cbd0d9'},
};
const colorMap = new Map(Object.entries(palette).flatMap(([property, colors]) =>
    Object.entries(colors).flatMap(([input, output]) => input.split(' ').map(hex => [property + '-' + hex, output]))));
function applyPalette(code) {
    return code.replace(/(bg|text|border|outline|ring)-\[#([\da-f]{3,8})\]/gi, (token, property, hex) => {
        const color = colorMap.get(property + '-' + hex.toLowerCase());
        return color ? `${property}-[#${color}]` : token;
    }).replaceAll('#d6efe9', '#e2e7f5').replaceAll('#82afb9', '#9caad3').replaceAll('#4c6e86', '#5a6fa5');
}

const result = await build({
    entryPoints: [join(local, 'entry.jsx')],
    absWorkingDir: source,
    nodePaths: [join(source, 'node_modules')],
    define: {'process.env.NODE_ENV': '"production"', 'import.meta.env': '{"BASE_URL":"/work-feed/","DEV":false}'},
    format: 'esm',
    bundle: true,
    minify: true,
    legalComments: 'eof',
    write: false,
    plugins: [{
        name: 'local-work-feed',
        setup(builder) {
            builder.onResolve({filter: /local-feed-(?:seed|visuals|projects)|source-feed-|(?:AuthContext|supabaseClient|workspaceDirectoryCache|workFeedLocation|profileImage)(?:\.js[x]?)?$/}, ({path}) => {
                const name = path.split('/').at(-1).replace(/\.js[x]?$/, '');
                return aliases[name] ? {path: aliases[name]} : null;
            });
            // The source component is shared with the PMO task board. Those
            // views cannot be reached from the open feed.
            builder.onResolve({filter: /PmoTask(?:BoardStaging|PickerModal)\.jsx$/}, () => ({path: 'unreachable-pmo', namespace: 'feed-unused'}));
            builder.onLoad({filter: /.*/, namespace: 'feed-unused'}, () => ({contents: 'export default function UnusedTaskView(){ return null; }'}));
            builder.onLoad({filter: /\.jsx$/}, async ({path}) => {
                if (!path.startsWith(join(source, 'src/')) && path !== join(local, 'entry.jsx')) return null;
                let contents = await readFile(path, 'utf8');
                if (path.endsWith('/LogWriteBox.jsx')) {
                    const original = "await mutateWorkFeed(feedKind, 'save', logId, {";
                    if (!contents.includes(original)) throw Error('원본 게시글 저장 위치가 바뀌었습니다.');
                    contents = contents.replace(original, original + '\n                    editing: Boolean(isEditing),');
                }
                if (path.endsWith('/WorkspaceActivityLog.jsx')) {
                    const deletion = "await mutateWorkFeed(feedKind, 'delete', logId);";
                    if (!contents.includes(deletion)) throw Error('원본 게시글 삭제 위치가 바뀌었습니다.');
                    contents = contents.replace(deletion, deletion + `
                if (readWorkFeedLocation().logId === String(logId)) {
                    writeWorkFeedLocation(feedKind, null, {replace: true});
                }`);
                    const row = 'aria-disabled={!checkUserAccess(log)}\n                                onClick={() => toggleExpand(log.log_id)}';
                    if (!contents.includes(row)) throw Error('원본 게시글 행 구조가 바뀌었습니다.');
                    contents = contents.replace(row, `role={feedKind ? 'button' : undefined}
                                tabIndex={feedKind && checkUserAccess(log) ? 0 : undefined}
                                aria-expanded={feedKind ? Boolean(expandedLogs[log.log_id]) : undefined}
                                onKeyDown={event => {
                                    if (feedKind && event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) {
                                        event.preventDefault();
                                        toggleExpand(log.log_id);
                                    }
                                }}
                                ${row}`);
                }
                contents = applyPalette(applyFeedPresentation(basename(path), contents));
                inputs.push({content: contents, extension: 'jsx'});
                return {contents, loader: 'jsx'};
            });
        },
    }],
});
const css = await compile('@import "tailwindcss" source(none);', {base: source, onDependency(){}});
const candidates = new Scanner({sources: []}).scanFiles(inputs);
await mkdir(output, {recursive: true});
await writeFile(join(output, 'app.js'), result.outputFiles[0].text);
await writeFile(join(output, 'app.css'), optimize(css.build(candidates), {minify: true}).code);

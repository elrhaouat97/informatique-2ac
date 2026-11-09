const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const base = '/informatique-2ac-15-seances';
let assertions = 0;
function equal(actual, expected, message) {assert.deepEqual(actual, expected, message);assertions++;}
function compile(file, imports = {}, prefix = base) {
  const module = {exports: {}};
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code, {module, exports: module.exports, process: {env: {NEXT_PUBLIC_COURSE_BASE_PATH: prefix}}, require: name => {
    if (Object.hasOwn(imports, name)) return imports[name];
    if (name.endsWith('.css')) return {};
    return require(name);
  }});
  return module.exports;
}
const assets = compile('lib/public-assets.ts');
const localAssets = compile('lib/public-assets.ts', {}, '');
for (const input of ['session3/visuels/logo-windows.svg', './session3/visuels/logo-windows.svg', '/session3/visuels/logo-windows.svg']) {
  equal(assets.publicAsset(input), base + '/session3/visuels/logo-windows.svg', 'production media uses repository root');
  equal(localAssets.publicAsset(input), '/session3/visuels/logo-windows.svg', 'local development uses origin root');
}
equal(assets.publicAsset(base + '/session3/visuels/logo-windows.svg'), base + '/session3/visuels/logo-windows.svg', 'prefix is not duplicated on restored URLs');
for (const external of ['https://images.unsplash.com/photo-test?a=1&b=2', '//example.org/image.jpg', 'data:image/svg+xml;base64,PHN2Zz4=', 'blob:https://example.org/demo', '#preview', '?image=1', '']) {
  equal(assets.publicAsset(external), external, 'external or non-path URL is preserved');
}
equal(assets.publicAsset(undefined), undefined, 'optional video poster remains optional');

const model = compile('app/session3-windows-model.ts');
const data = compile('app/session3-assessment-data.ts', {'./session3-windows-model': model});
let stage = 0;
const assessment = compile('app/session3-assessment.tsx', {
  '../lib/public-assets': assets,
  './session3-translation': {Session3Text: ({value}) => React.createElement('span', null, value.fr)},
  './session3-windows11': {Session3Windows11: () => null},
  './session3-windows-model': model,
  './session3-assessment-data': data,
  '../lib/learning-context': {useDurableLessonState: ({initial}) => ({value: {...initial, stage}, setValue() {}, ready: true})},
  '../lib/learning-storage': {},
});
for (stage of [0, 1]) {
  const markup = renderToStaticMarkup(React.createElement(assessment.Session3Assessment, {participantId: 'LOCAL-ASSET-CHECK', onRecordSubmission() {}}));
  const sources = [...markup.matchAll(/\bsrc="([^"]+)"/g)].map(match => match[1]);
  equal(sources.length, stage === 0 ? 6 : 3, 'real assessment renders all expected images/audio/video');
  for (const src of sources) {
    const student = new URL(src, 'https://tabdellah.github.io' + base + '/');
    const teacher = new URL(src, 'https://tabdellah.github.io' + base + '/enseignant/cours/');
    equal(teacher.href, student.href, 'teacher and student load exactly the same asset');
    equal(teacher.pathname.startsWith(base + '/enseignant/'), false, 'no request under the teacher page directory');
    equal(fs.existsSync(path.join(root, 'public', src.slice(base.length + 1))), true, 'rendered media exists in the published assets');
  }
}

console.log(JSON.stringify({passed: true, assertions}));

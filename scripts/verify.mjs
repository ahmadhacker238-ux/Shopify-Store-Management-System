import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
let failed=0,passed=0,warned=0;
const ok=name=>{passed++;console.log(`  PASS  ${name}`)};
const fail=(name,detail="")=>{failed++;console.log(`  FAIL  ${name}${detail?` — ${detail}`:""}`)};
const warn=(name,detail="")=>{warned++;console.log(`  WARN  ${name}${detail?` — ${detail}`:""}`)};
const exists=rel=>fs.existsSync(path.join(root,rel));
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");

console.log("\nShoply v1.5.0 verification\n");
const major=Number(process.versions.node.split(".")[0]);major>=20?ok(`Node.js ${process.versions.node}`):fail("Node.js 20+ required",process.versions.node);

let pkg;try{pkg=JSON.parse(read("package.json"));pkg.version==="1.5.0"?ok("package version is 1.5.0"):fail("package version",pkg.version);pkg.dependencies?.nodemailer?ok("nodemailer dependency declared"):fail("nodemailer dependency missing");}catch(error){fail("package.json parses",String(error))}

const required=[
  "src/components/VisualStoreBuilder.tsx","src/components/StorefrontClient.tsx","src/lib/theme.ts","src/lib/types.ts",
  "src/app/dashboard/theme/preview/page.tsx","src/app/api/stores/customizer/route.ts","src/app/api/contact/route.ts",
  "src/lib/auth.ts","src/lib/security.ts","src/lib/rate-limit.ts","src/app/api/stores/media/route.ts",
  "src/app/login/page.tsx","data/db.json","README.md","TESTING-CHECKLIST.md"
];
for(const file of required)exists(file)?ok(`required file: ${file}`):fail(`missing file: ${file}`);

try{
  const types=read("src/lib/types.ts"),theme=read("src/lib/theme.ts"),builder=read("src/components/VisualStoreBuilder.tsx"),css=read("src/app/globals.css"),preview=read("src/app/dashboard/theme/preview/page.tsx"),storefront=read("src/components/StorefrontClient.tsx");
  types.includes("version: 7")?ok("theme schema v7"):fail("theme schema v7 missing");
  types.includes('"productGrid"')&&types.includes('"map"')&&types.includes('"divider"')?ok("unified widget types declared"):fail("unified widget types missing");
  theme.includes("legacyToContainers")&&theme.includes("flatMap(legacyToContainers)")?ok("legacy sections auto-migrate into containers"):fail("legacy container migration missing");
  builder.includes('kind:"new-element"')&&builder.includes('kind:"element"')&&builder.includes('kind:"container"')?ok("drag payloads separate widgets and containers"):fail("drag payload model missing");
  builder.includes("element-drop-zone")&&builder.includes("page-drop-zone")&&css.includes(".element-drop-zone.active")&&css.includes(".page-drop-zone.active")?ok("visual insertion/drop indicators present"):fail("drop indicators missing");
  builder.includes('className="canvas-drag-handle" draggable')&&!builder.includes('className={`elementor-canvas-container ${selected?"selected":""}`} draggable')?ok("containers drag only from handle"):fail("container wrapper is still draggable");
  builder.includes('kind:"element",...target')?ok("widgets drag only from widget handle"):fail("widget handle drag missing");
  builder.includes("elementCatalog")&&!builder.includes("sectionLabels")?ok("single Containers + Widgets editor UI"):fail("legacy section picker still present");
  preview.includes("getDraftThemeConfig")?ok("merchant draft preview uses draft theme"):fail("draft preview does not use draft theme");
  storefront.includes("getPublishedThemeConfig")?ok("customer storefront uses published theme"):fail("customer storefront publish separation missing");
  builder.includes("columnDropIndex(e.currentTarget,e.clientY)")?ok("whole-column drag target computes insertion position"):fail("whole-column drag target missing");
  builder.includes("onClick={()=>onAddElement(widget.type)}")?ok("widget click-to-add fallback present"):fail("widget click-to-add fallback missing");
  builder.includes("builder-live-canvas")?ok("live canvas indicator present"):warn("live canvas indicator missing");
  builder.includes("p-builder-video-live")?ok("live video preview renderer present"):warn("live video preview renderer missing");
  builder.includes('onBack={clearSelection}')&&builder.includes('Back to Elements')?ok("element inspector returns directly to Elements"):fail("Back to Elements flow missing");
  builder.includes('type Panel="builder"|"site"')&&builder.includes("SiteSettingsPanel")&&!builder.includes('panel==="theme"')?ok("site-wide settings separated from element inspector"):fail("site settings still mixed into element editor tabs");
  builder.includes("elementor-sidebar-modebar")&&!builder.includes("elementor-panel-tabs")?ok("legacy five-tab sidebar removed"):fail("legacy sidebar tabs still present");
  css.includes(".site-settings-hub")&&css.includes(".inspector-back-to-elements")?ok("contextual builder navigation styles present"):fail("builder navigation styles missing");
  types.includes("BuilderResponsiveStyle")&&types.includes("hiddenOn?:BuilderDevice[]")?ok("responsive widget/container types declared"):fail("responsive types missing");
  builder.includes("ResponsiveContext")&&builder.includes("Reset {device}")&&builder.includes("Hide on mobile")?ok("device-specific inspector controls present"):fail("responsive inspector controls missing");
  storefront.includes("elementResponsiveVars")&&storefront.includes("responsiveHiddenClasses")?ok("public storefront receives responsive variables"):fail("storefront responsive renderer missing");
  css.includes("--shoply-el-font-t")&&css.includes(".shoply-hide-mobile")&&css.includes("--shoply-container-pad-m")?ok("responsive storefront CSS present"):fail("responsive storefront CSS missing");
  builder.includes("borderWidth")&&builder.includes("shadow")&&css.includes("--shoply-el-shadow")?ok("advanced border/shadow styling present"):fail("advanced widget styling missing");
  /templates:\s*BuilderTemplate\[\]/.test(types)&&(builder.includes("Reusable templates")||(builder.includes('"Patterns"')&&builder.includes("saveTemplate")))?ok("reusable section templates present"):fail("reusable templates missing");
  builder.includes("Media Library")&&exists("src/app/api/stores/media/route.ts")?ok("merchant media library present"):fail("media library missing");
  builder.includes("localStorage")&&builder.includes("beforeunload")?ok("local recovery and unsaved-change guard present"):fail("recovery protection missing");
  builder.includes("Ctrl+C copy")&&builder.includes("duplicateSelection")?ok("builder keyboard shortcuts present"):fail("builder shortcuts missing");
  types.includes("mobileOrder")&&storefront.includes("shoply-column-order-m")?ok("mobile column ordering present"):fail("mobile column ordering missing");
  read("src/lib/db.ts").includes("original file was preserved")?ok("invalid database JSON is preserved"):fail("database parse protection missing");
  read("src/lib/security.ts").includes("payment-proof")?ok("signed payment proof tokens present"):fail("payment proof signing missing");
}catch(error){fail("v1.5 source checks",String(error))}

try{
  const db=JSON.parse(read("data/db.json"));
  for(const key of ["users","stores","products","orders","collections","discounts","reviews","customers","returnRequests","passwordResets"])Array.isArray(db[key])?ok(`database array: ${key}`):fail(`database array missing: ${key}`);
  for(const key of ["emailChallenges","pages","media"]){if(db[key]===undefined)warn(`${key} array not in raw db`,"compatible with older database; it is added on the next write");else Array.isArray(db[key])?ok(`database array: ${key}`):fail(`${key} must be an array`)}
}catch(error){fail("data/db.json parses",String(error))}

const tscJs=path.join(root,"node_modules","typescript","bin","tsc");
const typescriptJs=path.join(root,"node_modules","typescript","lib","typescript.js");
const nodemailerPkg=exists("node_modules/nodemailer/package.json");
const completeDeps=["node_modules/next/package.json","node_modules/react/package.json","node_modules/react-dom/package.json","node_modules/nodemailer/package.json","node_modules/@types/nodemailer/package.json","node_modules/.bin/next.cmd","node_modules/.bin/tsc.cmd","node_modules/@next/swc-win32-x64-msvc/package.json"];
for(const dependency of completeDeps)exists(dependency)?ok(`bundled dependency: ${dependency}`):fail(`bundled dependency missing: ${dependency}`);
nodemailerPkg?ok("nodemailer installed"):fail("nodemailer installed");
if(fs.existsSync(tscJs)){
  const shim=path.join(root,"src","__shoply_verify_nodemailer.d.ts");
  if(!nodemailerPkg)fs.writeFileSync(shim,'declare module "nodemailer" { const nodemailer:any; export default nodemailer; }\n');
  console.log("\nRunning TypeScript type-check...");
  const result=spawnSync(process.execPath,[tscJs,"--noEmit","--pretty","false"],{cwd:root,stdio:"inherit",env:{...process.env,TERM:process.env.TERM||"dumb"}});
  if(fs.existsSync(shim))fs.unlinkSync(shim);
  result.status===0?ok("TypeScript type-check"):fail("TypeScript type-check","see errors above");
}else warn("TypeScript type-check skipped","node_modules is not installed");

if(fs.existsSync(typescriptJs)){
  try{
    const ts=(await import(pathToFileUrl(typescriptJs))).default;
    const compilerOptions={module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022};
    const widgetJs=ts.transpileModule(read("src/lib/elementor-widgets.ts"),{compilerOptions}).outputText;
    const widgetModule={exports:{}};const widgetSandbox={module:widgetModule,exports:widgetModule.exports,require,console,structuredClone,Math,Date,Number,String,Array,Object,RegExp,JSON};
    vm.runInNewContext(`(function(module,exports,require){${widgetJs}\n})(module,module.exports,require)`,widgetSandbox);
    const js=ts.transpileModule(read("src/lib/theme.ts"),{compilerOptions}).outputText;
    const module={exports:{}};const localRequire=id=>id==="./elementor-widgets"?widgetModule.exports:require(id);const sandbox={module,exports:module.exports,require:localRequire,console,structuredClone,Math,Date,Number,String,Array,Object,RegExp,JSON};
    vm.runInNewContext(`(function(module,exports,require){${js}\n})(module,module.exports,require)`,sandbox);
    const db=JSON.parse(read("data/db.json"));const store=db.stores?.[0];
    if(store){const migrated=module.exports.getDraftThemeConfig(store);migrated.version===7?ok("database theme migrates to schema v7"):fail("database theme migration version",String(migrated.version));migrated.sections.every(section=>section.type==="container")?ok("legacy sections migrate to container-only page"):fail("legacy sections remain after migration");}
  }catch(error){fail("runtime theme migration test",String(error))}
}else warn("runtime theme migration test skipped","TypeScript runtime is not installed");

const marker=exists(".shoply-needs-install");marker?fail("dependency install marker must not ship in complete package"):ok("dependency install marker absent");
if(exists("START.bat")){const startBat=read("START.bat");!/^\s*(?:call\s+)?npm\s+install\b/im.test(startBat)?ok("START.bat never runs npm install"):fail("START.bat still runs npm install");}else ok("npm run dev is used (START.bat removed per user command)");
if(exists("VERIFY.bat")){const verifyBat=read("VERIFY.bat");!/^\s*(?:call\s+)?npm\s+install\b/im.test(verifyBat)?ok("VERIFY.bat never runs npm install"):fail("VERIFY.bat still runs npm install");}
const envPath=path.join(root,".env.local");if(fs.existsSync(envPath)){const env=fs.readFileSync(envPath,"utf8");const keys=["SMTP_HOST","SMTP_USER","SMTP_PASS","EMAIL_FROM"];const missing=keys.filter(key=>!new RegExp(`^${key}=.+$`,`m`).test(env));missing.length?warn(".env.local email settings incomplete",missing.join(", ")):ok(".env.local contains required SMTP settings");}else warn(".env.local missing","email/login-code testing needs SMTP; login behavior itself is unchanged");

console.log(`\nResult: ${passed} passed, ${warned} warnings, ${failed} failed.`);
if(failed){console.log("Fix FAIL items before release testing.\n");process.exit(1)}
console.log("Automated sanity checks passed. Continue with TESTING-CHECKLIST.md.\n");

function pathToFileUrl(file){let resolved=path.resolve(file).replace(/\\/g,"/");if(!resolved.startsWith("/"))resolved=`/${resolved}`;return `file://${resolved}`}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
let passed=0;let failed=0;
function check(name,condition){if(condition){passed++;console.log(`  PASS  ${name}`)}else{failed++;console.log(`  FAIL  ${name}`)}}

console.log("\nShoply v1.5 focused verification\n");
const pkg=JSON.parse(read("package.json"));
const types=read("src/lib/types.ts");
const theme=read("src/lib/theme.ts");
const builder=read("src/components/VisualStoreBuilder.tsx");
const storefront=read("src/components/StorefrontClient.tsx");
const css=read("src/app/globals.css");
const db=read("src/lib/db.ts");
const orders=read("src/app/api/orders/route.ts");
const proof=read("src/app/api/payments/proof/route.ts");

check("package version 1.5.0",pkg.version==="1.5.0");
check("theme schema v7",types.includes("version: 7")&&theme.includes("version:7"));
check("reusable templates stored in theme",types.includes("BuilderTemplate")&&builder.includes("saveTemplate")&&builder.includes("insertTemplate"));
check("enhanced navigator controls",builder.includes("navigator-container-head")&&builder.includes("navigator-element-row"));
check("keyboard copy/paste shortcuts",builder.includes("copySelection")&&builder.includes("pasteSelection")&&builder.includes('key.toLowerCase()==="d"'));
check("autosave and browser recovery",builder.includes("shoply_builder_recovery_")&&builder.includes('persist("draft",true)')&&builder.includes("beforeunload"));
check("media library UI",builder.includes("function MediaLibrary")&&builder.includes("Choose from Media Library"));
check("media API exists",fs.existsSync(path.join(root,"src/app/api/stores/media/route.ts")));
check("advanced container fields",types.includes("containerBackgroundImage")&&types.includes("horizontalAlign")&&types.includes("mobileOrder"));
check("advanced containers render publicly",storefront.includes("containerGradient")&&storefront.includes("shoply-column-order-m")&&css.includes("--shoply-container-direction-m"));
check("database corruption never auto-wipes",db.includes("original file was preserved")&&(db.match(/JSON\.stringify\(emptyDb/g)||[]).length===1);
check("production secret guard",read("src/lib/security.ts").includes("SESSION_SECRET is required in production"));
check("rate limiting enabled",read("src/lib/rate-limit.ts").includes("checkRateLimit")&&orders.includes('scope:"checkout"')&&proof.includes('scope:"payment-proof"'));
check("payment proof is signed",proof.includes("createPaymentProofToken")&&orders.includes("verifyPaymentProofToken")&&!orders.includes("body.paymentProofUrl"));
check("demo card production guard",read("src/lib/payments.ts").includes('process.env.NODE_ENV!=="production"'));
check("database backup intentionally excluded",!fs.existsSync(path.join(root,"src/lib/database-backup.ts")));

console.log(`\nResult: ${passed} passed, ${failed} failed.\n`);
if(failed)process.exit(1);

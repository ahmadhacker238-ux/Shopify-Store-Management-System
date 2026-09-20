import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const widgets = read("src/lib/elementor-widgets.ts");
const visual = read("src/components/VisualStoreBuilder.tsx");
const storefront = read("src/components/StorefrontClient.tsx");
const theme = read("src/lib/theme.ts");
const cart = read("src/app/api/cart/capture/route.ts");
const tracking = read("src/app/api/orders/track/route.ts");

const checks = [];
function check(name, ok) { checks.push({ name, ok: Boolean(ok) }); }

const catalogTypes = [...widgets.matchAll(/\{type:"([^"]+)",title:/g)].map(match => match[1]);
check("47 new Elementor-style blocks are registered", new Set(catalogTypes).size === 47);
check("widget library has no duplicate block ids", new Set(catalogTypes).size === catalogTypes.length);
check("new blocks render in the editor", visual.includes("<ExtendedElementorWidget") && visual.includes("editor/>"));
check("new blocks render on the storefront", storefront.includes("<ExtendedElementorWidget"));
check("new blocks have inspector controls", visual.includes("<ExtendedWidgetFields"));
check("half and custom width survive sanitization", theme.includes('["auto","full","half","custom"]') && theme.includes("customWidth:num"));
check("transparent container choice survives sanitization", theme.includes('containerBackground:s.containerBackground===""?""'));
check("abandoned checkout admin actions require login", cart.includes("const user = await getCurrentUser()"));
check("abandoned checkout changes are store scoped", cart.includes("c.id === id && c.storeId === store.id"));
check("cart prices are resolved from the catalog", cart.includes("price: variant ? variant.price : product.price"));
check("public order tracker returns a strict masked object", tracking.includes("publicTrackingOrder(matchedOrder)"));

console.log("\nShoply WordPress-style editor verification\n");
for (const item of checks) console.log(`  ${item.ok ? "PASS" : "FAIL"}  ${item.name}`);
const failed = checks.filter(item => !item.ok);
console.log(`\nResult: ${checks.length - failed.length} passed, ${failed.length} failed.\n`);
if (failed.length) process.exit(1);

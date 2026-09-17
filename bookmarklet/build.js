import esbuild from 'esbuild';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'dist');
mkdirSync(outDir, { recursive: true });

const isWatch = process.argv.includes('--watch');

function emit(jsCode) {
  const uri = `javascript:${encodeURIComponent(jsCode)}`;

  writeFileSync(path.join(outDir, 'bookmarklet.min.js'), jsCode);
  writeFileSync(path.join(outDir, 'bookmarklet.txt'), uri);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>CSS Hover Inspector — Install</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #17181f; color: #e4e4e7; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { max-width: 440px; padding: 32px; background: #1f2029; border: 1px solid #2c2d38; border-radius: 12px; text-align: center; }
  h1 { font-size: 18px; margin: 0 0 8px; }
  p { color: #9797a3; font-size: 13px; line-height: 1.6; }
  .btn { display: inline-block; margin-top: 16px; padding: 10px 20px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: grab; }
</style>
</head>
<body>
  <div class="card">
    <h1>◈ CSS Hover Inspector</h1>
    <p>Drag this button to your bookmarks bar. Click it on any page to toggle the inspector.</p>
    <a class="btn" href="${uri}">CSS Hover Inspector</a>
  </div>
</body>
</html>`;
  writeFileSync(path.join(outDir, 'install.html'), html);

  const kb = (uri.length / 1024).toFixed(1);
  console.log(`✅ Bookmarklet built (${kb} KB)`);
  if (uri.length > 2000) {
    console.warn('⚠️  Over ~2000 chars — some older browsers cap bookmark URL length. Modern Chrome/Firefox are fine.');
  }
}

const options = {
  entryPoints: [path.join(__dirname, 'entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2018',
  write: false,
};

if (isWatch) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [{
      name: 'emit-on-rebuild',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length) return console.error('❌ Build error:', result.errors);
          emit(result.outputFiles[0].text);
        });
      },
    }],
  });
  await ctx.watch();
  console.log('👀 Watching core/ and bookmarklet/ for changes...');
} else {
  const result = await esbuild.build(options);
  emit(result.outputFiles[0].text);
}
import {build} from 'esbuild';
import {mkdir,readFile} from 'node:fs/promises';
const core=(await readFile(new URL('../.local/core-path',import.meta.url),'utf8')).trim();
await mkdir(new URL('../examples/mobile_application/assets/',import.meta.url),{recursive:true});
await build({entryPoints:[new URL('../src/device-integration.js',import.meta.url).pathname],
    outfile:new URL('../examples/mobile_application/assets/device-provider.js',import.meta.url).pathname,
    alias:{'@gramlot/gramlot/device-frames':core+'/js/src/device-frames.js'},
    external:['@gramlot/gramlot'],bundle:true,format:'esm',platform:'browser',target:'es2022',legalComments:'inline'});
console.log('Built examples/mobile_application/assets/device-provider.js');

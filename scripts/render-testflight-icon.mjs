// Rasterize the existing approved Gramlot vector, using the same renderer as its asset pipeline.
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
const [modules,source,destination]=process.argv.slice(2);
const sharp=createRequire(modules+'/package.json')('sharp');
const png=await sharp(await readFile(source),{density:288}).resize(1024,1024)
    .flatten({background:'#182333'}).png().toBuffer();
const metadata=await sharp(png).metadata();
if(metadata.width!==1024||metadata.height!==1024||metadata.hasAlpha)throw new Error('Invalid iOS app icon');
await writeFile(destination,png);
console.log('Gramlot icon: 1024 × 1024, opaque PNG.');

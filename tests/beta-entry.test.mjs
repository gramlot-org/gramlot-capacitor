import test, {mock} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const profile = JSON.parse(await readFile(new URL('../config/testflight/internal.json', import.meta.url)));
mock.module('../shell/target.js', {namedExports: {target: profile}});
const {Logic} = await import('../shell/logic.js');

test('beta entry, shortcut and link route to public destinations; local probe is unavailable', () => {
    const logic = new Logic(), navigations = [], writes = [];
    logic.page = {dom: {navigate: url => navigations.push(url)}};
    const node = {SET: (...args) => writes.push(args)};
    logic.openGallery();
    logic.openShortcut(node, {request: {getItem: () => 'gallery'}});
    logic.openLink(node, {request: {getItem: () => profile.exampleUrl}});
    logic.openLink(node, {request: {getItem: () => 'https://192.168.5.115:8443/device/'}});
    assert.throws(() => logic.openDeviceProbe(), /not part of this build/);
    assert.deepEqual(navigations, [profile.galleryUrl, profile.galleryUrl, profile.exampleUrl]);
    assert.deepEqual(writes.at(-1), ['view.linkError', 'Destination is not allowed']);
});

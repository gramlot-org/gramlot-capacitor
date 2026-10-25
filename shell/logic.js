import {target} from './target.js';
export const exampleUrl = target.exampleUrl;

export class Logic {
    openLink(node, {request}) {
        if (request === null || request === undefined) return;
        const url = request.getItem('url');
        if (url !== exampleUrl) {
            node.SET('view.linkError', 'Destination is not allowed');
            return;
        }
        node.SET('view.linkError', null);
        this.page.dom.navigate(url);
    }
    openShortcut(node, {request}) {
        if (request?.getItem('destination') === 'gallery') this.openGallery();
    }
    openGallery() { this.page.dom.navigate(target.galleryUrl); }
    openDeviceProbe() {
        if(target.deviceProbeUrl===null)throw new Error('Local probes are not part of this build');
        this.page.dom.navigate(target.deviceProbeUrl);
    }
}

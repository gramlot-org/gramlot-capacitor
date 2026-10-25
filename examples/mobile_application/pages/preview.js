import {installDeviceFrameHost} from './device-provider.js';
export class Logic {
    previewInit() { installDeviceFrameHost(this.page, {origins:[window.location.origin]}); }
}

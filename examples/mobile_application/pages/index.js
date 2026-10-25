import {attachDeviceProvider} from './device-provider.js';

export class Logic {
    appearanceConfirm(node) { node.SET('view.appearance.message', 'Page Data updated'); }
    appearanceReset(node) { node.SET('view.appearance.notes', null); }
    deviceCopyText(node) { node.FIRE('gramlot.device.clipboard?copy'); }
    devicePasteText(node) { node.FIRE('gramlot.device.clipboard?paste'); }
    transformCss({x, y, rotate, zoom}) {
        return `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${zoom})`;
    }
    transformReleased(node) {
        this.page.publish('transformReleased', Object.fromEntries(
            ['x', 'y', 'rotate', 'zoom'].map(name => [name, node.GET(`view.transform.${name}`)])));
    }
    transformReceived(node, values) {
        for (const name of ['x', 'y', 'rotate', 'zoom']) node.SET(`view.transform.last.${name}`, values[name]);
        node.SET('view.transform.releases', node.GET('view.transform.releases') + 1);
    }
    deviceAudioStart(node) { node.FIRE('gramlot.device.audio?start'); }
    deviceAudioStop(node) { node.FIRE('gramlot.device.audio?stop'); }
    deviceAudioShare(node) { node.FIRE('gramlot.device.audio?share'); }
    deviceAudioShareDisabled({status, shareStatus}) { return status !== 'success' || shareStatus === 'pending'; }
    deviceAudioCancel(node) { node.FIRE('gramlot.device.audio?cancel'); }
    deviceAudioBusy({status, shareStatus}) { return status === 'pending' || status === 'recording' || shareStatus === 'pending'; }
    deviceAudioCanStop({status}) { return status !== 'recording'; }
    deviceAudioCanCancel({status, shareStatus}) { return shareStatus === 'pending' || !['pending', 'recording', 'success', 'error'].includes(status); }
    deviceVibrate(node) { node.FIRE('gramlot.device.haptics?vibrate'); }
    deviceImpact(node, {intensity}) {
        node.SET('gramlot.device.haptics?style', intensity);
        node.FIRE('gramlot.device.haptics?impact');
    }
    deviceLifecycleEvent(node, {sequence, event}) {
        if (!sequence) return;
        const path = event === 'pause' ? 'view.lifecycle.pauses' : 'view.lifecycle.resumes';
        node.SET(path, node.GET(path) + 1);
    }
    deviceOpenShortcut(node, {request}) {
        if (request === null || request === undefined) return;
        if (request.getItem('destination') !== 'gallery') {
            node.SET('view.shortcuts.error', 'Shortcut destination is not allowed');
            return;
        }
        node.SET('view.shortcuts.error', null);
        this.page.dom.navigate('https://gallery-py.gramlot.dev/');
    }
    deviceRegisterPush(node) {
        node.SET('view.push.serverRegistration', null);
        node.SET('view.push.serverStatus', null);
        node.SET('view.push.serverError', null);
        node.FIRE('gramlot.device.push?register');
    }
    deviceScheduleNotification(node) { node.FIRE('gramlot.device.notifications?schedule'); }
    deviceVerifyBiometrics(node) { node.FIRE('gramlot.device.biometrics?verify'); }
    deviceScanBarcode(node) { node.FIRE('gramlot.device.barcode?scan'); }
    deviceCapture(node) { node.FIRE('gramlot.device.camera?capture'); }
    deviceChoosePhoto(node) { node.FIRE('gramlot.device.camera?choose'); }
    devicePending({status}) { return status === 'pending'; }
    deviceError({error}) { return error ? `${error.code}: ${error.message}` : ""; }
    async deviceAttach(node, {notificationId, notificationTitle, notificationBody, notificationDelay}) {
        node.SET('view.lifecycle.pauses', 0);
        node.SET('view.lifecycle.resumes', 0);
        await attachDeviceProvider(this.page);
        if(this.page.state==='disposed')return;
        node.SET('gramlot.device.clipboard?text', 'GRAMLOT-CLIPBOARD-001');
        node.SET('gramlot.device.notifications.request.id', notificationId);
        node.SET('gramlot.device.notifications.request.title', notificationTitle);
        node.SET('gramlot.device.notifications.request.body', notificationBody);
        node.SET('gramlot.device.notifications.request.delay', notificationDelay);
    }
    deviceRefresh(node, {name}) { this.page.dvc.refresh(name); }
    deviceInvalidate(node, {name}) { this.page.dvc.invalidate(name); }
}

import * as THREE from 'three-universal/build/three.node.js';
import utils from 'jsdom/lib/jsdom/living/generated/utils.js';
import { Blob, resolveObjectURL } from 'buffer';

global.document = THREE.window.document;

const _URL = global.URL;
const _Fetch = THREE.window._resourceLoader.fetch;

function _readBlobURL(url) {
    const dataURL = resolveObjectURL(url);

    let timeoutId;
    const promise = new Promise(async resolve => {
      timeoutId = setTimeout(resolve, 0, Buffer.from(await dataURL.arrayBuffer()));
    });
    promise.abort = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };

    return promise;
}

THREE.window._resourceLoader.fetch = function(urlString, { accept, cookieJar, referrer } = {}) {    
    if(urlString.substring(0, 5) === 'blob:') {
        return _readBlobURL(urlString);
    }

    return _Fetch.apply(this, arguments);
}

THREE.window.URL.createObjectURL = (blob) => {
    return _URL.createObjectURL(new Blob([blob[utils.implSymbol]._buffer], { type: blob.type }));
}

THREE.window.URL.revokeObjectURL = (url) => {
    _URL.revokeObjectURL(url);
}

export { THREE }
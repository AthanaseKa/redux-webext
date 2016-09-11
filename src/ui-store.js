import {
    CONNECTION_NAME,
    DISPATCH,
    UPDATE_STATE
} from './constants';

let listeners = [];
let state;

function handleMessage(msg) {
    if (msg.type === UPDATE_STATE) {
        state = msg.data;

        listeners.forEach(l => l());
    }
}

function subscribe(listener) {
    listeners.push(listener);

    // return unsubscribe function
    return function () {
        listeners = listeners.filter(l => l !== listener);
    };
}

function dispatch(data) {
    // perform an action to change state of "background" store
    chrome.runtime.sendMessage({
        type: DISPATCH,
        data
    });
}

function getState() {
    return state;
}

export default function () {
    // connect to "background" store
    const connection = chrome.runtime.connect({name: CONNECTION_NAME});

    // listen for changes in the "background" store
    connection.onMessage.addListener(handleMessage);

    // return promise to allow getting current state of "background" store
    return new Promise(resolve => {
        chrome.runtime.sendMessage({type: UPDATE_STATE}, null, res => {
            state = res;

            // return an object with equivalent to Redux store interface
            resolve({
                subscribe,
                dispatch,
                getState
            });
        });
    });
}

const WebSocket = require('ws');

/**
 * Opens a WebSocket connection and returns it
 * @returns {Promise<null|WebSocket>}
 */
exports.getOpenWebsocket = async function getOpenWebsocket() {
    const ws = new WebSocket('ws://localhost:5001');

    const openWebsocketPromise = new Promise((resolve) => {
        ws.on('open', async () =>
            resolve(null));

        ws.onerror = function (error) {
            console.error(`Error opening a websocket connection: ${error && error.message ? error.message : error}`);
            return resolve(null);
        };
    });


    try {
        await openWebsocketPromise;

        return ws;
    } catch (e) {
        console.error(`getOpenWebsocket got exception: ${e}`);
        return null;
    }
}


/**
 * Send a message via Websockets
 * @param ws Websockets instance
 * @param source The type of sender
 * @param sourceId The id of the sender
 * @param messageType The type of message
 * @param lithiumRoomId
 * @param messagePayload
 */
exports.sendWebsocketMessage = function (ws, source, sourceId, messageType, lithiumRoomId, messagePayload) {
    if (!ws) {
        console.warn(`sendMessage received null ws - ${source} - ${sourceId} - ${messageType} - ${lithiumRoomId}`);
        return;
    }

    const message = {
        source: source,
        sourceId: sourceId,
        type: messageType,
        lithiumRoomId: lithiumRoomId,
        payload: messagePayload,
    };

    try {
        ws.send(JSON.stringify(message));
    } catch (e) {
        console.error(`Exception sending websocket message: ${e}`, message);
    }
}
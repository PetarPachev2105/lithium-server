const WebSocket = require('ws');
const asyncJS = require('async');
const url = require('url');
const IDGenerator = require('../lib/idGenerator');

/* LUTs for Websocket clients */
const lithiumRoomLUT = {}; // LUT based on Chat Room ID = {lithiumRoomId: [ws clients]

const lithiumHoodLUT = {}; // LUT based on Chat Room ID = {lithiumRoomId: [ws clients]

/* NoOp function for ping/pong */
function noop() {
}

/* Heartbeat function for ping/pong */
function heartbeat() {
    // console.log(`heartbeat for ${this.id}`);
    this.isAlive = true;
}

/**
 * Function removes the given Websockets client from any LUT we find it in
 * @param ws
 */
function removeClientFromLUTS(ws) {
    /* Check if we have to remove this client from the LUT */
    if (ws.lithiumHoodId) {
        // console.log(`removing ${ws.id} from lithiumRoomLUT`);
        if (lithiumHoodLUT[ws.lithiumHoodId] && lithiumHoodLUT[ws.lithiumHoodId][ws.id]) {
            delete lithiumHoodLUT[ws.lithiumHoodId][ws.id];
        }
    } else if (ws.lithiumRoomId) {
        if (lithiumRoomLUT[ws.lithiumRoomId] && lithiumRoomLUT[ws.lithiumRoomId][ws.id]) {
            delete lithiumRoomLUT[ws.lithiumRoomId][ws.id];
        }
    }
}

/* initialize the WebSocket server instance (config is from ws readme) */
const wss = new WebSocket.Server({
    port: 5001,
});

/* Ping - Pong interval */
const interval = setInterval(() => {
    // console.log('Client terminator function running');

    wss.clients.forEach((ws) => {
        // console.log(`ws client: ${JSON.stringify(ws)}`);

        // console.log(`checking ws: ${ws.id} - ${ws.isAlive} - ${ws.lithiumRoomId}`);

        if (ws.isAlive === false) {
            /* Client is no longer alive. Remove it from our LUTs */
            removeClientFromLUTS(ws);
            return ws.terminate(); // send termination to client
        }

        // console.log(`${ws.id} isAlive is set to FALSE`);
        ws.isAlive = false;
        ws.ping(noop);
    });
}, 1000 * 30);

/**
 * Handle close event
 * */
wss.on('close', () => {
    clearInterval(interval);
});

/**
 * Handle incoming connections
 */
wss.on('connection', (ws, req) => {
    // console.log(`Websockets - connection. URL = ${req.url}`);
    ws.isAlive = true; // Set alive flag to true
    ws.id = IDGenerator.generateUUID();
    ws.on('pong', heartbeat); // Handle pongs

    const parameters = url.parse(req.url, true);
    if (parameters.query) {
        /* If we have query params (i.e., we got a connect from lithium-client */
        const lithiumHoodId = parameters.query.lithiumHoodId;
        const lithiumRoomId = parameters.query.lithiumRoomId;

        /* If we got a discrete clientId value from the client, set that as the client id on our side */
        if (parameters.query.clientId) {
            ws.id = parameters.query.clientId;
            // console.log(`WS client: ${ws.id}`);
        }

        if (lithiumHoodId) {
            ws.lithiumHoodId = lithiumHoodId;

            lithiumHoodLUT[lithiumHoodId] = lithiumHoodLUT[lithiumHoodId] || {};
            lithiumHoodLUT[lithiumHoodId][ws.id] = (ws);

            // console.log(`lithiumRoomLUT: ${JSON.stringify(lithiumRoomLUT)}`)

            console.log(`lithiumHoodLUT for ${lithiumHoodId} now has ${Object.keys(lithiumHoodLUT[lithiumHoodId]).length} clients connected`);
        } else if (lithiumRoomId) {
            /* Set the lithiumRoomId of the ws client object */
            ws.lithiumRoomId = lithiumRoomId;

            lithiumRoomLUT[lithiumRoomId] = lithiumRoomLUT[lithiumRoomId] || {};
            lithiumRoomLUT[lithiumRoomId][ws.id] = (ws);

            // console.log(`lithiumRoomLUT: ${JSON.stringify(lithiumRoomLUT)}`)

            console.log(`lithiumRoomLUT for ${lithiumRoomId} now has ${Object.keys(lithiumRoomLUT[lithiumRoomId]).length} clients connected`);
        }
    }

    ws.on('open', () => {
        console.log('Websockets - open');
    });

    ws.on('close', () => {
        removeClientFromLUTS(ws);
    });

    /**
     * Handle message receipt
     */
    ws.on('message', async (data) => {
        // console.log(`Websockets - message received = ${JSON.stringify(data)}`);

        const message = JSON.parse(data);

        // console.log('WS message', message);

        if (message.source === 'lithiumRoom') {
            const lithiumRoomId = message.lithiumRoomId;
            // console.log(`ws-worker => ${message.type} lithiumRoomId = ${lithiumRoomId}`);

            // Find clients that are listening to this lithium room
            const clients = lithiumRoomLUT[lithiumRoomId] || [];
            // console.log(`ws-worker => ${message.type} ${lithiumRoomId} has ${clients.length} to update`);

            await asyncJS.eachLimit(clients, 5, (client, eachLimitCallback) => {
                const clientMessage = {
                    source: message.source,
                    sourceId: message.sourceId,
                    type: message.type,
                    lithiumRoomId: message.lithiumRoomId,
                    payload: message.payload,
                };

                client.send(JSON.stringify(clientMessage));

                return eachLimitCallback(null);
            });
        } else if (message.source === 'lithiumHood') {
            const lithiumHoodId = message.lithiumHoodId;
            // console.log(`ws-worker => ${message.type} lithiumHoodId = ${lithiumHoodId}`);

            // Find clients that are listening to this lithium room
            const clients = lithiumHoodLUT[lithiumHoodId] || [];
            // console.log(`ws-worker => ${message.type} ${lithiumHoodId} has ${clients.length} to update`);

            await asyncJS.eachLimit(clients, 5, (client, eachLimitCallback) => {
                const clientMessage = {
                    source: message.source,
                    sourceId: message.sourceId,
                    type: message.type,
                    lithiumHoodId: message.lithiumHoodId,
                    payload: message.payload,
                };

                client.send(JSON.stringify(clientMessage));

                return eachLimitCallback(null);
            });
        }
    });
});

module.exports = wss;
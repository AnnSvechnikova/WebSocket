const client = require("./grpc-client")

const ws = require('ws');
const {parse} = require("querystring");

const wss = new ws.Server({
    port: 5000,
}, () => console.log(`Server started on 5000`))


wss.on('connection', function connection(ws, connectionRequest) {

    const [_path, params] = connectionRequest.url.split("?");
    const connectionParams = parse(params);
    //console.log(connectionParams);
    //после подключения отправляем все сообщения
    sendList(ws, connectionParams);
    // обработка событий
    ws.on('message', function (message) {
        message = JSON.parse(message)
        switch (message.event) {
            case 'get_msg':
                sendList(ws);
                break;
            case 'delete_msg':
                console.log("удаление сообщения")
                //ws.send(message)
                break;
        }
    })
})

function sendList(ws, params) {
    client.List(params, (error, msgs) => {
        if (!error) throw error;
        ws.send(JSON.stringify(msgs));
        console.log(msgs);
    });
}

function broadcastMessage(message, id) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(message))
    })
}

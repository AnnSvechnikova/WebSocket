const ws = require('ws');
const {parse} = require("querystring");

const wss = new ws.Server({
    port: 5000,
}, () => console.log(`Server started on 5000`))

/* шаблон сообщения для добавления, надо только менять parent и что-то еще по желанию
{
        "event":"create_msg",
        "topic": 2,
        "sender": 3,
        "text": "new message",
        "sent_time": "2023-05-24T20:50:36.807876Z",
        "is_deleted": false,
        "parent": "3"
    }
 */

messages = {
    "results": [
        {
            "id": 1,
            "topic": 1,
            "sender": 1,
            "text": "highload apps are awesome",
            "sent_time": "2023-05-24T20:33:36.807876Z",
            "is_deleted": false,
            "parent": "-1"
        },
        {
            "id": 2,
            "topic": 1,
            "sender": 2,
            "text": "yes they are",
            "sent_time": "2023-05-24T20:33:36.807876Z",
            "is_deleted": false,
            "parent": "1"
        },
        {
            "id": 4,
            "topic": 2,
            "sender": 1,
            "text": "bmstu is the  best uni",
            "sent_time": "2023-05-24T20:33:36.807876Z",
            "is_deleted": false,
            "parent": "-1"
        }
    ]
}

wss.on('connection', function connection(ws, connectionRequest) {

    const [_path, params] = connectionRequest.url.split("?");
    const connectionParams = parse(params);
    //console.log(connectionParams);
    //после подключения отправляем все сообщения
    ws.send(JSON.stringify(messages.results));
    // обработка событий
    ws.on('message', function (message) {
        message = JSON.parse(message)
        switch (message.event) {
            case 'get_msg':
                ws.send(JSON.stringify(messages.results));
                break;
            case 'delete_msg':
                console.log("удаление сообщения")
                ind = messages.results.findIndex(el=> el.id === message.id)
                messages.results[ind].is_deleted = true;
                ws.send(JSON.stringify({"deleted":true}));
                break;
            case 'create_msg':
                console.log('новое сообщение');
                new_msg = {
                    "id": messages.results[messages.results.length-1].id + 1,
                    "topic": message.topic,
                    "sender": message.sender,
                    "text": message.text,
                    "sent_time": message.sent_time,
                    "is_deleted": message.is_deleted,
                    "parent": message.parent
                };
                messages.results.push(new_msg);
                broadcastMessage(new_msg);

        }
    })
})

function broadcastMessage(message, id) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(message))
    })
}
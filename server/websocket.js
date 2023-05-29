const MsgClient = require("./grpc-client")

const ws = require('ws');
const {parse} = require("querystring");

const wss = new ws.Server({
    port: 5000,
}, () => console.log(`Server started on 5000`))


/*const root_cert = fs.readFileSync('path/to/root-cert');
const ssl_creds = grpc.credentials.createSsl(root_cert)
const stub = new helloworld.Greeter('myservice.example.com', ssl_cr*/

wss.on('connection', function connection(ws, connectionRequest) {
    ws.send(JSON.stringify({
        status:"connected"
    }))
    const [_path, params] = connectionRequest.url.split("?");
    const connectionParams = parse(params);
    //console.log(connectionParams);
    //!!!!!!!!!!Вернуть !!!!!!!!!после подключения отправляем все сообщения
    //sendList(ws, connectionParams);
    // обработка событий
    ws.on('message', function (message) {
        message = JSON.parse(message)
        switch (message.event) {
            case 'get_msg':
                sendList(ws);
                break;
            case 'create_msg':
                postMsg(ws, message);
                break;
            case 'close':
                ws.close(1000, JSON.stringify({message:"connection closed due to user logout"}));
                break;
            case 'delete_msg':
                console.log("удаление сообщения")
                //ws.send(message)
                break;
        }
    })
})

//список всех сообщений
function sendList(ws, params) {
    MsgClient.List({}, (error, msgs) => {
        if (error) throw error;
        msgs.results = msgs.results.map((m) => transform(m))
        ws.send(JSON.stringify(msgs));
    });
}

//нужна, тк поля parent и topic имеют тип long (int64)
function transform(m)
{
    m.parent = m.parent.toNumber();
    m.topic = m.topic.toNumber();
    return m;
}

//новое сообщение
function postMsg(ws, params) {
    let new_msg = {
        id: null,
        parent: params.parent,
        topic: params.topic,
        sender: params.sender,
        text: params.text,
        sent_time: params.sent_time,
        is_deleted: false,
    }
    MsgClient.Create(new_msg, (error, res) =>
    {
        if(error) throw error;
        ws.send(JSON.stringify({
            status:"ok"
        }))
    });
}

function broadcastMessage(message, id) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify())
    })
}

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
    //после подключения отправляем все сообщения
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
            case 'get_one_msg':
                sendMsg(ws, message);
                break;
            case 'delete_msg':
                delMsg(ws, message);
                break;
            case 'close':
                ws.close(1000, JSON.stringify({message:"connection closed due to user logout"}));
                break;

        }
    })
})

//список всех сообщений
function sendList(ws, params) {
    MsgClient.List({}, (error, msgs) => {
        if (error) throw error;
        //console.log(msgs);
        if (!msgs.results)
            msgs = {};
        else
           msgs.results = msgs.results.map((m) => transform(m));
        ws.send(JSON.stringify(msgs));
    });
}

//нужна, тк поля parent и topic имеют тип long (int64)
function transform(m)
{
    if(m.parent)
        m.parent = m.parent.toNumber();
    else
        m.parent = -1;
    m.topic = m.topic.toNumber();
    return m;
}

//новое сообщение
function postMsg(ws, params) {
    let new_msg = {
        parent: params.parent? params.parent:null,
        topic: params.topic,
        sender: params.sender,
        text: params.text
        //sent_time: params.sent_time,
        //is_deleted: false
    }
    //{
    //             "event": "create_msg",
    //             "topic": 4,
    //             "sender": 1,
    //             "text": "i like this topic",
    //             "sent_time": "2023-05-24T20:33:36.807876Z",
    //             "is_deleted": false
    // }.log(new_msg);
    MsgClient.Create(new_msg, (error, res) =>
    {
        if(error) throw error;
        ws.send(JSON.stringify({
            status:"ok"
        }))
    });
    broadcastMessage(new_msg);
}

function broadcastMessage(message) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(message));
    })
}

function sendMsg(ws, params){
    if (params.id)
    {
        let msg_req = {
            id: params.id
        }
        MsgClient.Retrieve(msg_req, (error, res) => {
            if(error) throw error;
            ws.send(JSON.stringify(transform(res)));
        });
    }
    else
        ws.send(JSON.stringify({}));

}

function delMsg(ws, params){
    if (params.id)
    {
        let msg_req = {
            id: params.id,
            is_deleted: true,
            _partial_update_fields: ["is_deleted"]
        }
        console.log(msg_req);
        MsgClient.PartialUpdate(msg_req, (error, res) => {
            if(error) throw error;
            ws.send(JSON.stringify({
                status:"ok"
            }))
            console.log(res);
        });
    }
    else
        ws.send(JSON.stringify({}));

}

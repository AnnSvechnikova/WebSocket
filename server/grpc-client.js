const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
const PROTO_PATH = "./message.proto";

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const MsgController = grpc.loadPackageDefinition(packageDefinition).MsgController;

const client = new MsgController(
    "grpc://127.0.0.1:50051",
    grpc.credentials.createInsecure()
);

module.exports = client;
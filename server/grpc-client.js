const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinitionConv = protoLoader.loadSync(path.join(__dirname, './convosphere_backend.proto'));
const MessageProto = grpc.loadPackageDefinition(packageDefinitionConv);
const MsgController = MessageProto.convosphere_backend.convosphere_backend.MessageController;
const MessageClient = new MsgController('127.0.0.1:50051', grpc.credentials.createInsecure());

module.exports = MessageClient;



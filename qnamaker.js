var restify = require('restify');
var builder = require('botbuilder');
var cognitiveServices = require('botbuilder-cognitiveservices');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Listen for messages from users 
server.post('/api/messages', connector.listen());
// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector);

//POST /knowledgebases/bb9f5a37-2fa5-4b61-a997-a14e49895ef3/generateAnswer
//Host: https://westus.api.cognitive.microsoft.com/qnamaker/v2.0
//Ocp-Apim-Subscription-Key: 18aac9430b6c48ae8d3e6e21458cd025
//Content-Type: application/json
//{"question":"hi"}

var qnaMakerRecognizer = new cognitiveServices.QnAMakerRecognizer({
    knowledgeBaseId: 'bb9f5a37-2fa5-4b61-a997-a14e49895ef3',
    subscriptionKey: '18aac9430b6c48ae8d3e6e21458cd025'
});

var qnaMakerDialog = new cognitiveServices.QnAMakerDialog({
    recognizers: [qnaMakerRecognizer],
    qnaThreshold: 0.4,
    defaultMessage: 'Désolée, je n\'ai pas compris, veuillez reformuler votre question.'
});

bot.dialog('/', qnaMakerDialog);
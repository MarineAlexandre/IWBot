var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(process.env.port || 3978, function(){
	console.log(`server name : ${server.name} | server url : ${server.url}`);
});

var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD 
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function(session){
    if(session.dialogData === null){
        session.send(`Welcome !`);
    }

    bot.on('typing', function(){
        session.send(`tu es en train d'écrire`);
    });

    session.send(`Ok, ça fonctionne !! | [Message.length = ${session.message.text.length} ]`);
    session.send(`Ok, ça fonctionne !! | [DialogData = ${JSON.stringify(session.dialogData)} ]`);
    session.send(`Ok, ça fonctionne !! | [SessionState = ${JSON.stringify(session.sessionState)} ]`);
});
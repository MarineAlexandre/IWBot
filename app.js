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
   //envoyer un message de bienvenue lorsqu'un utlisateur arrive sur le bot
   bot.on('conversationUpdate', function(message){
   		if (message.membersAdded) {
   			message.membersAdded.forEach(function (identity){
   				if (identity.id !== message.address.bot.id) {
   					bot.send(new builder.Message()
   							.address(message.address)
   							.text("Welcome " + identity.name));
   				}
   			});
   		}
   });

   //si doheavywork est écrit, attend un laps de temps avant d'envoyer une réponse
	
	if (session.message.text.toLowerCase() == 'doheavywork') {
		session.sendTyping();
		//timeout
		setTimeout(function() {
			session.send("Good Job !");
		}, 5000);
	}

    bot.on('typing', function(){
        session.send(`tu es en train d'écrire`);
    });

    //session.send(`Ok, ça fonctionne !! | [Message.length = ${session.message.text.length} ]`);
    //session.send(`Ok, ça fonctionne !! | [DialogData = ${JSON.stringify(session.dialogData)} ]`);
    //session.send(`Ok, ça fonctionne !! | [SessionState = ${JSON.stringify(session.sessionState)} ]`);
});
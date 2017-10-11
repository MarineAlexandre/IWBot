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

var bot = new builder.UniversalBot(connector, 
	function(session){
		session.send('Bienvenue dans le Bot Résa !')
		session.beginDialog('greetings');
	}
);

var res = [];
bot.dialog('greetings', [
	function(session){
		session.beginDialog('askName');
	},
	function (session, results) {
		session.endDialog('Hello %s!', results.response);
		res['nom'] = results.response;
		session.beginDialog('askNumber');
	}
]);

bot.dialog('askName', [
	function (session) {
		builder.Prompts.text(session, 'Quel est votre nom ?');
	},
	function (session, results) {
		session.endDialogWithResult(results);
	}
]);

bot.dialog('askNumber', [
	function (session) {
		builder.Prompts.text(session, 'Pour combien de personnes voulez-vous réserver ?');
	},
	function (session, results) {
		session.endDialog('Vous réservez pour %s personnes.', results.response);
		res['personnes'] = results.response;
		session.beginDialog('askDate');
	}
]);

bot.dialog('askDate', [
	function (session) {
		builder.Prompts.text(session, 'A quelle date souhaitez-vous réserver ?');
	},
	function (session, results) {
		session.endDialog('Vous avez réservé au %s.', results.response);
		res['date'] = results.response;
		session.send('Récapitulatif de votre réservation : %s, pour %s personnes le %s', res['nom'], res['personnes'], res['date']);
	}
]);
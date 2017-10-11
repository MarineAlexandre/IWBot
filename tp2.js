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
		session.beginDialog('menu');
	}
);

var res = [];
bot.dialog('menu', [
	function(session){
		builder.Prompts.choice(session, 'Que choisissez-vous ?', "Votre nom|Nombre d'invités|Date|Téléphone", { listStyle: builder.ListStyle.button });
	},
	function (session, results) {
		var index = results.response.index;
		switch(index) {
			case 0:
				session.replaceDialog('askName');
				break;
			case 1:
				session.replaceDialog('askNumber');
				break;
			case 2:
				session.replaceDialog('askDate');
				break;
			case 3:
				session.replaceDialog('askPhone');
				break;
		}
	}
]).triggerAction({
	matches : /^menu$/i,
	confirmPrompt : "Retour au menu ?"
});

bot.dialog('askName', [
	function (session) {
		builder.Prompts.text(session, 'Quel est votre nom ?');
	},
	function (session, results) {
		session.endDialog('Hello %s!', results.response);
		res['nom'] = results.response;
		session.replaceDialog('askNumber');
	}
]);

bot.dialog('askNumber', [
	function (session) {
		builder.Prompts.text(session, 'Pour combien de personnes voulez-vous réserver ?');
	},
	function (session, results) {
		session.endDialog('Vous réservez pour %s personnes.', results.response);
		res['personnes'] = results.response;
		session.replaceDialog('askDate');
	}
]);

bot.dialog('askDate', [
	function (session) {
		builder.Prompts.text(session, 'A quelle date souhaitez-vous réserver ?');
	},
	function (session, results) {
		session.endDialog('Vous avez réservé au %s.', results.response);
		res['date'] = results.response;
		session.replaceDialog('askPhone');
	}
]);

bot.dialog('askPhone', [
    function (session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Entrez un numéro de téléphone au format 06XXXXXXXX ou 07XXXXXXXX")
        } else {
            builder.Prompts.text(session, "Quel est votre numéro de téléphone?");
        }
    },
    function (session, results) {
        var matched = results.response.match(/\d+/g);
        var number  = matched ? matched.join('') : '';
        if (number.length == 10 && (number.substring(0,2) == '06' || number.substring(0,2) == '07') ) {
            session.endDialog('Votre numero de téléphone est %s', number);
            res['telephone'] = number;
            session.send('Réservation faites au nom de %s, pour %s personnes le %s. Nous pouvons vous joindre au %s', res['nom'], res['personnes'], res['date'], res['telephone'])
        } else {
            session.replaceDialog('askPhone', { reprompt: true });
        }
    }
]);

bot.dialog('startOver', [
	function (session) {
		session.beginDialog('askName');
	}
]).triggerAction({
	matches : /^startover$/i,
	confirmPrompt : "Recommencer le formulaire ?"
});

bot.dialog('cancelAction', [
	function (session) {
		res = [];
		session.beginDialog('askName');
	}
]).triggerAction({
	matches : /^cancelaction$/i,
	confirmPrompt : "Annuler ?"
});
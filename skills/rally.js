var rallyLib = require('../submodules/rallyLib.js');

// scope of where these commands will trigger (anywhere the bot is, right now)
var listenScope = {
	"everywhere": 'ambient,direct_message,direct_mention,mention',
}

var generatePlainAttachmentStr = function(title, str){
	var retAttachment = {
		"attachments": [{
			"fallback": title,
			"title": title,
			"text": str,
			"callback_id": 'hideButton-0',
			"actions": [
				{
					"name": "hide",
					"text": "Hide this message",
					"value": "hide",
					"type": "button"
				}
			]
		}]
	};
	return retAttachment;
}

var regexList = {
	"DE": /(?:^|\W)DE([0-9]+).*$/i,
	"US": /(?:^|\W)US([0-9]+).*$/i,
}
var isCaseMentioned = function(str){
	var regexList = {
		"case1": /^.*ts([0-9]+).*$/im,
		"case2": /^.*ts ([0-9]+).*$/im,
		"case3": /^.*case ([0-9]+).*$/im,
		"case4": /^.*case([0-9]+).*$/im,
		"case5": /^.*#([0-9]+).*$/im,
		"case6": /^.*# ([0-9]+).*$/im,
		"case7": /^.*case: ([0-9]+).*$/im,
	}

	if(regexList['case1'].exec(str) !== null
		|| regexList['case2'].exec(str) !== null
		|| regexList['case3'].exec(str) !== null
		|| regexList['case4'].exec(str) !== null
		|| regexList['case5'].exec(str) !== null
		|| regexList['case6'].exec(str) !== null
		|| regexList['case7'].exec(str) !== null
	) return true;
	return false;
}

module.exports = function(controller) {
	controller.hears([regexList["US"]], listenScope["everywhere"], function(bot, message) {
		console.log("Caught userstory mention ", message.text);

		if(message.event == 'ambient' && typeof message.thread_ts != 'undefined' && isCaseMentioned(message.text)) return true;
		
		var rallyID = message.match[1];
		
		bot.startConversationInThread(message, (err, convo) =>{
			if (!err) {
				//convo.say("Bringing up snapshot of the defect DE" + message.match[2]);
				controller.extDB.lookupUser(bot, message, (err, user)=>{
					if(!err){
						rallyLib.queryRally("US"+rallyID, user.sf_username, (result)=>{
							if(result.error){
								
								console.log("WARNING: error fetching user story: ", result.errorMSG);
								var attachment = generatePlainAttachmentStr("Error fetching US"+message.match[2], result.errorMSG);
								attachment.attachments[attachment.attachments.length-1].callback_id = 'deleteButton-0';
								attachment.attachments[attachment.attachments.length-1].actions = [
									{
										"name": "hide",
										"text": "Hide this message",
										"value": "hide",
										"type": "button"
									}
								];
								
								convo.say(attachment);
								convo.next();
						
							}else{								
								var attachment = rallyLib.generateSnapshotAttachment(result);
								
								// add a hide button
								attachment.attachments[attachment.attachments.length-1].callback_id = 'deleteButton-0';
								attachment.attachments[attachment.attachments.length-1].actions = [
									{
										"name": "hide",
										"text": "Hide this message",
										"value": "hide",
										"type": "button"
									}
								];
								
								convo.say(attachment);
								convo.next();
							}
						});
					}else{
						console.log("WARNING: failed reading slack username when processing US ID");
						convo.stop();
					}
				});
			}
		});
		return true;		// allow other matching handlers to fire
	});

	controller.hears([regexList["DE"]], listenScope["everywhere"], function(bot, message) {

		console.log("caught defect mention:", message.text);
		if(message.event == 'ambient' && typeof message.thread_ts != 'undefined' && isCaseMentioned(message.text)) return true;

		var rallyID = message.match[1];

		bot.startConversationInThread(message, (err, convo)=> {
			if (!err) {
				controller.extDB.lookupUser(bot, message, (err, user)=>{
					if(!err){
						rallyLib.queryRally("DE"+rallyID, user.sf_username, (result)=>{
							if(result.error){
								console.log("WARNING: error fetching defect: ", result.errorMSG);
								var attachment = generatePlainAttachmentStr("Error fetching DE"+message.match[2], result.errorMSG);
								attachment.attachments[attachment.attachments.length-1].callback_id = 'deleteButton-0';
								attachment.attachments[attachment.attachments.length-1].actions = [
									{
										"name": "hide",
										"text": "Hide this message",
										"value": "hide",
										"type": "button"
									}
								];
								
								convo.say(attachment);
								convo.next();
						
							}else{
								var attachment = rallyLib.generateSnapshotAttachment(result);
								
								// add a hide button
								attachment.attachments[attachment.attachments.length-1].callback_id = 'deleteButton-0';
								attachment.attachments[attachment.attachments.length-1].actions = [
									{
										"name": "hide",
										"text": "Hide this message",
										"value": "hide",
										"type": "button"
									}
								];
								
								convo.say(attachment);
								convo.next();
							}
						});
					}else{
						console.log("WARNING: failed reading slack username when processing DE ID");
						convo.stop();
					}
				});
			}
		});
		
		return true;		// allow other matching handlers to fire
	});
};

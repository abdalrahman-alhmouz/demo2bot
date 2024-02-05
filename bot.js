const {
    TurnContext,
    MessageFactory,
    TeamsInfo,
    TeamsActivityHandler,
    CardFactory,
    ActionTypes
  } = require('botbuilder');
  const AWS = require('aws-sdk');
  
  const AWS_REGION = process.env.AWS_REGION;
  const AWS_ACCESS_KEY_ID =process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY=process.env.AWS_SECRET_ACCESS_KEY;  
  const LAMBDA_FUNCTION_NAME = process.env.LAMBDA_FUNCTION_NAME;
  
  class EchoBot extends TeamsActivityHandler {
    constructor() {
      super();
  
      this.onMessage(async (context, next) => {
        TurnContext.removeRecipientMention(context.activity);
        await this.callLambda(context);
        await next();
      });
  
      this.onMembersAddedActivity(async (context, next) => {
        context.activity.membersAdded.forEach(async (teamMember) => {
          if (teamMember && teamMember.id !== context.activity.recipient.id) {
            await context.sendActivity(`Hi, Welcome to the team ${teamMember.givenName} ${teamMember.surname}`);
          }
        });
        await next();
      });
    }
  
    async callLambda(context) {
      const lambda = new AWS.Lambda({
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      });
  
      const params = {
        FunctionName: LAMBDA_FUNCTION_NAME,
        Payload: JSON.stringify({
            "sessionId": context.activity.from.id,
            "chatbots": [
                {
                    "Id": "8485f930-0ff9-11ee-b08c-8786e4e82602",
                    "language": "en_US"
                },
                {
                    "Id": "7903a760-0ff9-11ee-8d46-ff9fa07c51e7",
                    "language": "ar_AE"
                }
            ],
            "message": context.activity.text.trim(),
            "botId": "GGTR0NCGIV",
            "botAliasId": "TSTALIASID",
            "chatbotId": "8485f930-0ff9-11ee-b08c-8786e4e82602",
            "sessionDetails": {
                "intentName": null,
                "messageFormat": "PlainText",
                "sessionAttributes": {
                    "userNumber": "whatsapp:+962782602840",
                    "useExistedLanguage": "true",
                    "language": "ar_AE",
                    "secondIntent": "false",
                    "secondMessage": "true"
                },
                "multiLanguage": true,
                "callCustomFunctions": true,
                "language": "en_US",
                "slotToElicit": null,
                "slots": {
                    "name": null,
                    "email": null,
                    "phone": "962782602840"
                },
                "channelUserName": "عبدالرحمن الحموز"
            },
            "name": null,
            "email": null,
            "phone": "962782602840",
            "sessionAttributes": {
                "inputData": context.activity.text.trim()
            },
            "userInfo": {
                "name": "null",
                "email": "null",
                "phone": "962782602840"
            }
        }
        
        )
      };
  
      try {
        const response = await lambda.invoke(params).promise();
        let message = JSON.parse(response.Payload);
        message=message.messages[0].content;
  console.log("message response",message)
     await context.sendActivity(MessageFactory.text(message, message));
//  message = 'Your message text';
//     const buttonTitle = 'Button Text';
//     const buttonValue = 'Button Value';

//     const reply = MessageFactory.text(message);
//     reply.suggestedActions = {
//       actions: [
//         { type: ActionTypes.ImBack, title: buttonTitle, value: buttonValue }
//       ]
//     };

//     await context.sendActivity(reply);
      } catch (error) {
        console.error(`Error calling Lambda: ${error}`);
        await context.sendActivity(MessageFactory.text('Oops, Something went wrong. Please try again later.'));
      }
    }
  }
  
  module.exports.EchoBot = EchoBot;
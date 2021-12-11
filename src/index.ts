import TwitterApi from 'twitter-api-v2';
import { twitterKey, slackWebhookUrl } from './settings';
import { IncomingWebhook, IncomingWebhookSendArguments } from '@slack/webhook';

// Instanciate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi(twitterKey);
// Tell typescript it's a readonly app
const roClient = twitterClient.readOnly;

const slackTest = async () => {
  const slackMessage = new IncomingWebhook(slackWebhookUrl);
  const slackMessageContent: IncomingWebhookSendArguments = {
    attachments: [
      {
        color: '#1976d2',
        text: 'これはSlack投稿のテスト',
      },
    ],
  };

  return await slackMessage.send(slackMessageContent);
};

const handler = async () => {
  // Play with the built in methods
  const user = await roClient.v2.userByUsername('__poc_sleepy__');
  console.log(user);
  console.log(slackTest());
};

handler();

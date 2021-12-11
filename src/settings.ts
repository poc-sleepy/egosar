require('dotenv').config();

if (process.env.TWITTER_KEY === undefined) {
  throw Error('TWITTER_KEY is not found');
}
export const twitterKey = process.env.TWITTER_KEY;

if (process.env.SLACK_WEBHOOK_URL === undefined) {
  throw Error('SLACK_WEBHOOK_URL is not found');
}
export const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

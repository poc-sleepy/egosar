require('dotenv').config();

if (process.env.TWITTER_KEY === undefined) {
  throw Error('TWITTER_KEY is not found');
}
export const twitterKey = process.env.TWITTER_KEY;

if (process.env.TWITTER_QUERY === undefined) {
  throw Error('TWITTER_QUERY is not found');
}
export const twitterQuery = process.env.TWITTER_QUERY;

if (process.env.SLACK_WEBHOOK_URL === undefined) {
  throw Error('SLACK_WEBHOOK_URL is not found');
}
export const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

export const newest_id_filepath =
  process.env.NEWEST_ID_FILEPATH || 'data/newest_id.txt';

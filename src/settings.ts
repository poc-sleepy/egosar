require('dotenv').config();

if (process.env.TWITTER_KEY === undefined) {
  throw Error('TWITTER_KEY is not found');
}
export const twitterKey = process.env.TWITTER_KEY;

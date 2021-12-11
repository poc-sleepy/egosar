import TwitterApi from 'twitter-api-v2';
import { twitterKey } from './settings';

// Instanciate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi(twitterKey);
// Tell typescript it's a readonly app
const roClient = twitterClient.readOnly;

const handler = async () => {
  // Play with the built in methods
  const user = await roClient.v2.userByUsername('__poc_sleepy__');
  console.log(user);
};

handler();

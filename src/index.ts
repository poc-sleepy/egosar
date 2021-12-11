import TwitterApi from 'twitter-api-v2';
import { twitterKey, slackWebhookUrl, twitterQuery } from './settings';
import { IncomingWebhook, IncomingWebhookSendArguments } from '@slack/webhook';

type Tweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  source?: string;
  is_retweet: Boolean;
  author?: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
};

const searchTweets = async () => {
  const twitterClient = new TwitterApi(twitterKey);
  const roClient = twitterClient.readOnly;

  const { data, includes, meta } = await roClient.v2.search(twitterQuery, {
    max_results: 10,
    'tweet.fields': ['created_at', 'source'],
    expansions: ['author_id'],
    'user.fields': ['username', 'name', 'profile_image_url'],
  });

  const tweets: Tweet[] = data.data.map((tweet) => ({
    ...tweet,
    created_at:
      tweet.created_at &&
      new Date(Date.parse(tweet.created_at)).toLocaleString('ja-JP'),
    author: includes.users?.find((user) => user.id === tweet.author_id),
    is_retweet: tweet.text.startsWith('RT @'),
  }));

  return tweets;
};

const postSlackMessageOfTweet = async (tweet: Tweet) => {
  const tweetUrl = `https://twitter.com/${tweet.author?.username}/status/${tweet.id}`;
  const slackMessageContent: IncomingWebhookSendArguments = {
    attachments: [
      {
        color: tweet.is_retweet ? '#4caf50' : '#1976d2',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `by <${tweetUrl}|*${tweet.author?.name}* (@${tweet.author?.username})>\n${tweet.text}`,
            },
            accessory: {
              type: 'image',
              image_url: tweet.author?.profile_image_url,
              alt_text: tweet.author?.name,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'plain_text',
                text: `${tweet.created_at} (${tweet.source})`,
              },
            ],
          },
          { type: 'divider' },
        ],
      },
    ],
  };

  const slackMessage = new IncomingWebhook(slackWebhookUrl);
  const result = await slackMessage.send(slackMessageContent);
  return result;
};

const handler = async () => {
  const tweets = await searchTweets();
  tweets.map(async (tweet) => {
    console.log(await postSlackMessageOfTweet(tweet));
  });
};

handler();

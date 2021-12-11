import fs from 'fs';
import TwitterApi from 'twitter-api-v2';
import {
  twitterKey,
  slackWebhookUrl,
  twitterQuery,
  newest_id_filepath,
} from './settings';
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

const searchTweets = async (
  query: string,
  sinceId?: string,
  max_results = 10 // 指定可能な最小値: 10
) => {
  const twitterClient = new TwitterApi(twitterKey);
  const readOnlyClient = twitterClient.readOnly;

  const { data } = await readOnlyClient.v2.search(query, {
    max_results,
    since_id: sinceId,
    'tweet.fields': ['created_at', 'source'],
    expansions: ['author_id'],
    'user.fields': ['username', 'name', 'profile_image_url'],
  });
  const { includes, meta } = data;

  if (meta.result_count === 0) {
    return { tweets: [] as Tweet[], meta };
  }

  const tweets: Tweet[] = data.data.map((tweet) => ({
    ...tweet,
    created_at:
      tweet.created_at &&
      new Date(Date.parse(tweet.created_at)).toLocaleString('ja-JP'),
    author: includes?.users?.find((user) => user.id === tweet.author_id),
    is_retweet: tweet.text.startsWith('RT @'),
  }));

  return { tweets: tweets.slice().reverse(), meta }; // ツイート日時降順を昇順に直している
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

const loadNewestTweetId = () => {
  if (fs.existsSync(newest_id_filepath)) {
    return fs.readFileSync(newest_id_filepath).toString();
  } else {
    return undefined;
  }
};

const writeNewestTweetId = (newestId: string) => {
  fs.writeFileSync(newest_id_filepath, newestId);
};

const handler = async () => {
  const newest_id = loadNewestTweetId();
  const { tweets, meta } = await searchTweets(twitterQuery, newest_id);
  console.log(`${meta.result_count} tweets found.`);

  if (tweets.length > 0) {
    writeNewestTweetId(meta.newest_id);
    tweets.map(async (tweet) => {
      await postSlackMessageOfTweet(tweet);
    });
  }
};

handler();

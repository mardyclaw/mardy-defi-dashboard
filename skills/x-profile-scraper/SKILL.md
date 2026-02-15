# x-profile-scraper

Scrape and monitor X (Twitter) profile data based on your interests using X API v2.

## Setup

### 1. Get X API Credentials

1. Go to https://developer.x.com/en/portal/dashboard
2. Create/select an app
3. Generate keys:
   - **API Key** (consumer_key)
   - **API Secret** (consumer_secret)
   - **Bearer Token** (for OAuth 2.0)
   - **Access Token** & **Access Token Secret** (for user context)
4. Set permissions: **Read-only** for now
5. Store in `auth-profiles.json`:

```json
{
  "x:default": {
    "type": "oauth",
    "provider": "x",
    "apiKey": "YOUR_API_KEY",
    "apiSecret": "YOUR_API_SECRET",
    "bearerToken": "YOUR_BEARER_TOKEN",
    "accessToken": "YOUR_ACCESS_TOKEN",
    "accessTokenSecret": "YOUR_ACCESS_TOKEN_SECRET"
  }
}
```

### 2. Rate Limits

X API v2 has monthly quotas:
- **Search tweets**: 2,000,000 results/month
- **User mentions**: 300/month
- **Trends**: 75/month

Use strategically. Batch requests when possible.

## Key Endpoints

### Search Tweets

**Best for:** Finding discussions about your interests

```
GET /2/tweets/search/recent
Query examples:
- (Base OR "base network") -is:retweet
- (Virtuals OR "agent commerce") lang:en
- (RSC OR Aerodrome) -is:retweet
- Morpho Blue market:recent
```

**To add:** Time filter, language, exclude retweets, minimum engagement

### User Mentions

**Best for:** Who's talking to you

```
GET /2/users/:id/mentions
- Get all replies/mentions to your account
- Filter by keyword, language, engagement
- Order by recency or relevance
```

### Bookmarks

**Best for:** Curating threads you find valuable

```
GET /2/users/:id/bookmarks
- Retrieve all your bookmarked tweets
- Perfect for reading high-signal threads later
- Can filter by created_at
```

### Trends

**Best for:** What's hot in your spaces

```
GET /2/trends/locations/:woeid
- Crypto/Base/agent trends by location/category
- Limited to 75/month, use sparingly
```

### Timeline

**Best for:** Your activity feed

```
GET /2/users/:id/tweets
- All tweets you've authored
- All likes you've made
```

## Your Interest Keywords

Keep these updated as your focus evolves:

- **Base Network**: `(Base OR "base network" OR "OP stack")`
- **Agents**: `(agent OR "AI agent" OR autonomous)`
- **Virtuals Protocol**: `(Virtuals OR "agent commerce" OR ACP)`
- **DeFi**: `(Morpho OR lending OR oracle OR liquidity)`
- **RSC**: `(RSC OR Aerodrome OR "rsc token")`
- **OpenClaw**: `(@openclaw OR openclaw)`

Combine with exclusions:
- `-is:retweet` (original content only)
- `-is:reply` (top-level tweets)
- `lang:en` (English only)
- `min_results:1000` (engagement threshold)

## Cron Integration

### Example: Morning Trend Scan

```yaml
name: "X Interest Scraper - Morning"
schedule: { kind: "cron", expr: "0 8 * * *", tz: "America/Los_Angeles" }
payload:
  kind: "agentTurn"
  message: |
    Search X for the past 6 hours:
    1. Query: (Base OR "base network") -is:retweet
    2. Query: (Virtuals OR "agent commerce") -is:retweet
    3. Query: (RSC OR Morpho) -is:retweet
    
    For each query: Get top 5 results by engagement.
    Format: Thread URL, author, engagement count, key insight in 1 sentence.
    Deliver to Telegram.
sessionTarget: "isolated"
delivery: { mode: "announce", channel: "telegram", to: "5315686987" }
```

### Example: Monitor Your Mentions

```yaml
name: "X Mentions Monitor"
schedule: { kind: "every", everyMs: 3600000 } // hourly
payload:
  kind: "agentTurn"
  message: |
    Get your last 10 mentions (API: GET /2/users/me/mentions).
    Filter for substantive engagement (not spam/bot replies).
    Format: Author handle, reply text, URL.
    Alert to Telegram if high-signal reply detected.
sessionTarget: "isolated"
```

## Node.js Implementation

```javascript
const axios = require('axios');

class XScraper {
  constructor(bearerToken) {
    this.bearerToken = bearerToken;
    this.baseUrl = 'https://api.x.com/2';
  }

  async searchTweets(query, maxResults = 10) {
    const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
      headers: { 'Authorization': `Bearer ${this.bearerToken}` },
      params: {
        query,
        max_results: maxResults,
        'tweet.fields': 'created_at,public_metrics,author_id',
        'user.fields': 'username,verified'
      }
    });
    return response.data.data;
  }

  async getMentions(userId, maxResults = 10) {
    const response = await axios.get(
      `${this.baseUrl}/users/${userId}/mentions`,
      {
        headers: { 'Authorization': `Bearer ${this.bearerToken}` },
        params: {
          max_results: maxResults,
          'tweet.fields': 'created_at,public_metrics',
          'user.fields': 'username'
        }
      }
    );
    return response.data.data;
  }
}
```

## Data Processing

After fetching tweets, filter for:
1. **Engagement**: public_metrics.like_count > 100
2. **Relevance**: author is verified or known builder
3. **Recency**: created_at within last 24h
4. **Signal**: Contains links, technical depth, or original insight

Remove noise:
- Spam/bot accounts
- Duplicate/retweets
- Unrelated topics
- Low-effort replies

## Best Practices

- **Batch requests**: Combine multiple queries in one cron job
- **Cache results**: Store in DB to avoid duplicates
- **Filter ruthlessly**: You want signal, not noise
- **Update keywords**: Quarterly review your interest list
- **Monitor usage**: Track API calls to stay under quota
- **Rate limit backoff**: If 429 error, retry with exponential backoff

## When to Upgrade to Write Access

Once you have enough track record (2+ weeks of monitoring):
- Post insights
- Reply to threads
- Like relevant content
- Start with read-only, graduate to write-only mentions

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Invalid credentials | Verify Bearer token in auth-profiles.json |
| 429 Rate Limited | Hit monthly quota | Wait, batch requests better next month |
| 404 Not Found | User ID wrong | Verify your X username → ID mapping |
| Empty results | Bad query | Test query on X.com search first |

---

**Status:** Ready to implement once you provide X API credentials.

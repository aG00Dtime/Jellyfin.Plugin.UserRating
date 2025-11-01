# Jellyfin User Ratings Plugin

**Rate and review content with other users on your Jellyfin server**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Jellyfin 10.9.0+](https://img.shields.io/badge/Jellyfin-10.9.0%2B-blue)](https://jellyfin.org/)

A social rating system for Jellyfin that lets users rate movies, TV shows, and music, then see what other users on the server think!

---

## Features

- Rate content 1-5 stars
- See ratings from other users on your server
- Average ratings displayed on item pages
- Optional notes/comments with ratings
- Per-user rating history
- RESTful API for custom integrations

## Installation

1. Open **Jellyfin Dashboard** → **Plugins** → **Repositories**
2. Add repository URL:
   ```
   https://raw.githubusercontent.com/aG00Dtime/Jellyfin.Plugin.UserRating/main/manifest.json
   ```
3. Go to **Catalog**, find **User Ratings**, and install
4. Restart Jellyfin

## API Usage

### Rate an Item
```bash
POST /UserRatings/Rate?itemId={itemId}&rating=5&note=Amazing!
Headers: X-Emby-Token: {your-api-key}
```

### Get Item Ratings
```bash
GET /UserRatings/Item/{itemId}
Headers: X-Emby-Token: {your-api-key}
```

Response:
```json
{
  "success": true,
  "ratings": [
    {
      "userId": "...",
      "userName": "Dad",
      "rating": 5,
      "note": "Great movie!",
      "timestamp": "2025-11-01T12:00:00Z"
    }
  ],
  "averageRating": 4.3,
  "totalRatings": 3
}
```

### Get My Rating
```bash
GET /UserRatings/MyRating/{itemId}
Headers: X-Emby-Token: {your-api-key}
```

### Get User's All Ratings
```bash
GET /UserRatings/User/{userId}
Headers: X-Emby-Token: {your-api-key}
```

### Delete My Rating
```bash
DELETE /UserRatings/Rating?itemId={itemId}
Headers: X-Emby-Token: {your-api-key}
```

## Configuration

**Dashboard** → **Plugins** → **User Ratings**

| Setting | Description |
|---------|-------------|
| **Enable Notifications** | Notify users when someone rates content |
| **Show Average on Items** | Display average rating on item pages |

## Use Cases

**Family Server**
- See what family members think before watching
- Find highly-rated content quickly
- Share opinions about shows

**Friend Group**
- "Dad rated Breaking Bad 5 stars"
- "Mom: 3/5 - Too violent"
- Average: 4.2/5 stars from 3 users

**Movie Club**
- Track what everyone has watched
- Compare tastes and preferences
- Discover new content based on friend ratings

## Future Features

- Rating notifications
- "Users who liked this also liked..."
- Taste compatibility scores
- Sort/filter by ratings
- Rating activity feed

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Made for the Jellyfin community


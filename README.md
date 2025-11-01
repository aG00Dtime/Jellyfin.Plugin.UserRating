# Jellyfin User Ratings Plugin

**Rate and review content with other users on your Jellyfin server**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Jellyfin 10.9.0+](https://img.shields.io/badge/Jellyfin-10.9.0%2B-blue)](https://jellyfin.org/)

A social rating system for Jellyfin that lets users rate movies, TV shows, episodes, and music, then see what other users on the server think!

---

## Features

- ⭐ Rate any content 1-5 stars
- 👥 See ratings from other users on your server
- 📊 Average ratings displayed in popup
- 💬 Optional notes/comments with ratings
- 📺 Works on movies, TV shows, episodes, and music
- 🎨 Works across all Jellyfin UIs (web, mobile, etc.)

## Installation

1. Open **Jellyfin Dashboard** → **Plugins** → **Repositories**
2. Add repository URL:
   ```
   https://raw.githubusercontent.com/aG00Dtime/Jellyfin.Plugin.UserRating/main/manifest.json
   ```
3. Go to **Catalog**, find **User Ratings**, and install
4. Restart Jellyfin

## Usage

### Quick Setup (Recommended)

1. Go to **Dashboard → General → Custom CSS**
2. Add this line:
   ```html
   <script src="https://raw.githubusercontent.com/aG00Dtime/Jellyfin.Plugin.UserRating/main/loader.html"></script>
   ```
3. Click **Save** and refresh Jellyfin

### Manual Setup (Alternative)

1. **Open the plugin settings** once (Dashboard → Plugins → User Ratings)
2. The UI will be enabled automatically after that

### Using the Plugin

1. **Navigate to any movie, show, episode, or music item**
2. **Click the floating ★ button** in the bottom right corner
3. **Rate with stars**, add an optional note, and save
4. **See what others rated** in the same popup!

## Configuration

**Dashboard** → **Plugins** → **User Ratings**

| Setting | Description |
|---------|-------------|
| **Enable Notifications** | Notify users when someone rates content (future feature) |
| **Show Average on Items** | Display average rating on item pages (future feature) |

## Use Cases

**Family Server**
- See what family members think before watching
- Find highly-rated content quickly
- Share opinions about shows and episodes

**Friend Group**
- "Dad rated Breaking Bad S01E01 5 stars - Amazing pilot!"
- "Mom: 3/5 - Too violent for me"
- Average: 4.2/5 stars from 3 users

**Movie Club**
- Track what everyone has watched and rated
- Compare tastes and preferences
- Discover new content based on friend ratings

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Made for the Jellyfin community


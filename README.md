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

## Setup

**One-time setup** - Add this single line to Jellyfin's Custom CSS:

1. Go to **Dashboard → General → Custom CSS**
2. Paste this at the top:
   ```html
   <script src="https://raw.githubusercontent.com/aG00Dtime/Jellyfin.Plugin.UserRating/main/loader.html"></script>
   ```
3. Click **Save** and refresh

That's it! The ★ button will now appear on all item pages.

## Usage

1. Navigate to any **movie, TV show, episode, or music** item
2. Click the **floating ★ button** in the bottom right
3. **Rate with 1-5 stars**, optionally add a note
4. Click **Save Rating**
5. See **all ratings** from other users in the same popup!

### Features

- ⭐ **Your rating** - visible stars you can click to change
- 📝 **Optional notes** - add comments with your rating
- 👥 **Other users' ratings** - see everyone's ratings and notes
- 📊 **Average rating** - calculated automatically
- 🗑️ **Delete rating** - remove your rating anytime

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


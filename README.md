# Jellyfin User Ratings Plugin

**Rate and review content with other users on your Jellyfin server**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Jellyfin 10.9.0+](https://img.shields.io/badge/Jellyfin-10.9.0%2B-blue)](https://jellyfin.org/)

A social rating system for Jellyfin that lets users rate movies, TV shows, and episodes, then browse and discover what other users on the server think through a dedicated ratings viewer with smart filtering and sorting.

> **Note:** Currently supports **web UI only**. 

---

## Screenshots

### Rating Items
<img src="screenshots/browser.png" alt="Rating Interface" width="800">

### Viewer Ratings Page
<img src="screenshots/view user ratings.png" alt="Viewer Ratings Page" width="800">

### Mobile Support
<img src="screenshots/mobile_app.png" alt="Mobile Interface" width="400">

---

## Features

- ⭐ Rate any content 1-5 stars
- 👥 See ratings from other users on your server
- 📊 Average ratings displayed automatically with total rating counts
- 💬 Optional notes/comments with ratings
- 📺 Works on movies, TV shows, and episodes
- 🎬 **Viewer Ratings Page** - Dedicated browsing interface with:
  - 📋 Recently Rated sections (Movies, Shows, Episodes)
  - 🔢 Paginated "All Rated Items" view (24 items per page)
  - 🔄 8 sorting options: Rating (High/Low), Title (A-Z/Z-A), Recently/Oldest Rated, Most/Least Ratings
  - ⚙️ Configurable limit for recently rated items (5-50)
  - 🖼️ Native Jellyfin card styling with clickable navigation
  - 📺 Smart thumbnails (episodes show series posters)
- 🌐 Web interface support (desktop & mobile browsers)

## Installation

1. Open **Jellyfin Dashboard** → **Plugins** → **Repositories**
2. Add repository URL:
   ```
   https://raw.githubusercontent.com/aG00Dtime/Jellyfin.Plugin.UserRating/main/manifest.json
   ```
3. Go to **Catalog**, find **User Ratings**, and install
4. Restart Jellyfin

## Setup

**No setup required!** After installing and restarting Jellyfin, the ratings UI will automatically appear on item detail pages when accessing Jellyfin through a web browser.

## Usage

### Rating Items

1. Open Jellyfin in a **web browser** (desktop or mobile)
2. Navigate to any **movie, TV show, or episode** detail page
3. Scroll down - the **User Ratings** section appears at the bottom
4. **Rate with 1-5 stars** by clicking the stars
5. Optionally **add a note** to share your thoughts
6. Click **Save Rating**
7. See **all ratings** from other users below your rating!

### Browsing Ratings (Viewer Ratings Page)

1. Go to **Dashboard** → **Plugins** → **User Ratings** → **View Ratings** tab
2. Browse **Recently Rated** sections for Movies, Shows, and Episodes
3. Scroll to **All Rated Items** for the complete paginated list
4. Use the **dropdown menu** to sort by:
   - Rating: High to Low / Low to High
   - Title: A-Z / Z-A
   - Recently Rated / Oldest Rated
   - Most Ratings / Least Ratings
5. Click any card to navigate to that item's detail page

### Rating Features

- ⭐ **Your rating** - visible stars you can click to change
- 📝 **Optional notes** - add comments with your rating
- 👥 **Other users' ratings** - see everyone's ratings and notes
- 📊 **Average rating** - calculated automatically
- 🗑️ **Delete rating** - remove your rating anytime

## Configuration

**Dashboard** → **Plugins** → **User Ratings** → **Settings**

### Available Settings

- **Recently Rated Items Count** (5-50, default: 10)
  - Controls how many items appear in each "Recently Rated" section (Movies, Shows, Episodes)
  - The "All Rated Items" section remains paginated at 24 items per page


## Use Cases

**Family Server**
- Browse the Viewer Ratings page to see what family members are watching and enjoying
- Check ratings before picking your next movie night selection
- See trending content based on recent ratings

**Friend Group**
- Discover highly-rated content through the sorted "All Rated Items" view
- Track what everyone's been watching in the Recently Rated sections
- Compare opinions: "Dad rated Breaking Bad 5 stars, Mom gave it 3 stars"
- Share detailed thoughts with optional rating notes


## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Made for the Jellyfin community


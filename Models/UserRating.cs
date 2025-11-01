using System;
using System.Collections.Generic;

namespace Jellyfin.Plugin.UserRatings.Models
{
    public class UserRating
    {
        public Guid ItemId { get; set; }
        public Guid UserId { get; set; }
        public int Rating { get; set; } // 1-5
        public string? Note { get; set; }
        public DateTime Timestamp { get; set; }
        public string? UserName { get; set; } // Cached for display
    }

    public class RatingStats
    {
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public Dictionary<Guid, UserRating> UserRatings { get; set; } = new();
    }

    public class RatedItemSummary
    {
        public Guid ItemId { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public DateTime LastRated { get; set; }
    }
}


using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.UserRatings.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public int RecentlyRatedItemsCount { get; set; } = 10;
    }
}


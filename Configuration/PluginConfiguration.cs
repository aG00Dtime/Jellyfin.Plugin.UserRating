using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.UserRatings.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public PluginConfiguration()
        {
            EnableNotifications = true;
            ShowAverageOnItems = true;
        }

        public bool EnableNotifications { get; set; }
        public bool ShowAverageOnItems { get; set; }
    }
}


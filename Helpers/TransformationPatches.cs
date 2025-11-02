using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

namespace Jellyfin.Plugin.UserRatings.Helpers
{
    public static class TransformationPatches
    {
        public static string IndexHtml(JObject payload)
        {
            // Get the contents from the payload
            string? contents = payload["Contents"]?.ToString();
            if (string.IsNullOrEmpty(contents))
            {
                return "";
            }

            // Get version for cache-busting
            string version = typeof(Plugin).Assembly.GetName().Version?.ToString() ?? "1.0.0";
            
            // Script element to inject
            string scriptElement = $"<script plugin=\"UserRatings\" version=\"{version}\" src=\"/web/ConfigurationPage?name=ratings.js&v={version}\" defer></script>";

            // Remove any existing UserRatings scripts
            string cleaned = Regex.Replace(contents, "<script[^>]*plugin=[\"']UserRatings[\"'][^>]*></script>", "", RegexOptions.IgnoreCase | RegexOptions.Singleline);

            // Insert script before closing body tag
            string result = Regex.Replace(cleaned, "(</body>)", $"{scriptElement}$1", RegexOptions.IgnoreCase);

            return result;
        }
    }
}


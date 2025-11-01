using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using Jellyfin.Plugin.UserRatings.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.UserRatings
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
    {
        private readonly ILogger<Plugin> _logger;

        public override string Name => "User Ratings";

        public override Guid Id => Guid.Parse("b8c5d3e7-4f6a-8b9c-1d2e-3f4a5b6c7d8e");

        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer, ILogger<Plugin> logger)
            : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
            _logger = logger;

            // Inject ratings script into index.html
            if (!string.IsNullOrWhiteSpace(applicationPaths.WebPath))
            {
                var indexFile = Path.Combine(applicationPaths.WebPath, "index.html");
                if (File.Exists(indexFile))
                {
                    string indexContents = File.ReadAllText(indexFile);
                    
                    // Script to inject
                    string scriptReplace = "<script plugin=\"UserRatings\".*?</script>";
                    string scriptElement = "<script plugin=\"UserRatings\" src=\"/web/ConfigurationPage?name=ratings.js\"></script>";
                    
                    if (!indexContents.Contains(scriptElement))
                    {
                        _logger.LogInformation("Injecting User Ratings script into {indexFile}", indexFile);
                        
                        // Remove old scripts
                        indexContents = Regex.Replace(indexContents, scriptReplace, "", RegexOptions.Singleline);
                        
                        // Insert script before closing body tag
                        int bodyClosing = indexContents.LastIndexOf("</body>");
                        if (bodyClosing != -1)
                        {
                            indexContents = indexContents.Insert(bodyClosing, scriptElement);
                            
                            try
                            {
                                File.WriteAllText(indexFile, indexContents);
                                _logger.LogInformation("Successfully injected User Ratings script");
                            }
                            catch (Exception e)
                            {
                                _logger.LogError(e, "Error writing to {indexFile}", indexFile);
                            }
                        }
                    }
                    else
                    {
                        _logger.LogInformation("User Ratings script already injected");
                    }
                }
            }
        }

        public static Plugin? Instance { get; private set; }

        public IEnumerable<PluginPageInfo> GetPages()
        {
            return new[]
            {
                new PluginPageInfo
                {
                    Name = this.Name,
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.configPage.html"
                },
                new PluginPageInfo
                {
                    Name = "ratings.js",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.ratings.js"
                }
            };
        }
    }
}


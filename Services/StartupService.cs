using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Threading;
using System.Threading.Tasks;
using Jellyfin.Plugin.UserRatings.Helpers;
using MediaBrowser.Controller;
using MediaBrowser.Model.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace Jellyfin.Plugin.UserRatings.Services
{
    public class StartupService : IScheduledTask
    {
        private readonly IServerApplicationHost _serverApplicationHost;
        private readonly ILogger<Plugin> _logger;

        public StartupService(IServerApplicationHost serverApplicationHost, ILogger<Plugin> logger)
        {
            _serverApplicationHost = serverApplicationHost;
            _logger = logger;
        }

        public Task ExecuteAsync(IProgress<double> progress, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Registering file transformations for User Ratings plugin");

            var payloads = new List<JObject>();

            // Register transformation for index.html to inject our script
            {
                var payload = new JObject
                {
                    { "id", "b8c5d3e7-4f6a-8b9c-1d2e-3f4a5b6c7d8e" },
                    { "fileNamePattern", "index.html" },
                    { "callbackAssembly", GetType().Assembly.FullName! },
                    { "callbackClass", typeof(TransformationPatches).FullName! },
                    { "callbackMethod", nameof(TransformationPatches.IndexHtml) }
                };
                payloads.Add(payload);
            }

            // Try to find File Transformation plugin
            Assembly? fileTransformationAssembly =
                AssemblyLoadContext.All.SelectMany(x => x.Assemblies).FirstOrDefault(x =>
                    x.FullName?.Contains(".FileTransformation") ?? false);

            if (fileTransformationAssembly == null)
            {
                _logger.LogWarning("File Transformation plugin not found. User Ratings script injection will not work. Please install File Transformation plugin.");
                return Task.CompletedTask;
            }

            Type? pluginInterfaceType = fileTransformationAssembly.GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");

            if (pluginInterfaceType == null)
            {
                _logger.LogWarning("File Transformation PluginInterface not found.");
                return Task.CompletedTask;
            }

            MethodInfo? registerMethod = pluginInterfaceType.GetMethod("RegisterTransformation");

            if (registerMethod == null)
            {
                _logger.LogWarning("File Transformation RegisterTransformation method not found.");
                return Task.CompletedTask;
            }

            // Register each transformation
            foreach (var payload in payloads)
            {
                try
                {
                    registerMethod.Invoke(null, new object?[] { payload });
                    _logger.LogInformation("Registered transformation: {Id}", payload["id"]);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to register transformation: {Id}", payload["id"]);
                }
            }

            _logger.LogInformation("File transformations registered successfully");
            return Task.CompletedTask;
        }

        public IEnumerable<TaskTriggerInfo> GetDefaultTriggers()
        {
            // Run on startup
            return new[]
            {
                new TaskTriggerInfo
                {
                    Type = TaskTriggerInfo.TriggerStartup
                }
            };
        }

        public string Name => "User Ratings Startup";

        public string Key => "Jellyfin.Plugin.UserRatings.Startup";

        public string Description => "Startup Service for User Ratings plugin";

        public string Category => "Startup Services";
    }
}


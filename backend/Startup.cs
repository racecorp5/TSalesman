using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(TspFunctionNamespace.Startup))]

namespace TspFunctionNamespace
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            // Register any necessary services or extensions here
            // Example: builder.AddAzureStorage();
        }
    }
}
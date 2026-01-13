using System.Reflection;

namespace Webvoto.ElectionAuditor.Site.Classes;

public static class Util {

	public static string? GetProductVersion() => Assembly.GetEntryAssembly()?.GetName().Version?.ToString();
}

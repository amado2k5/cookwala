# Cookwala.Sdk (C#)

A hub client for .NET 8 using `HttpClient` and `System.Text.Json`, async methods, PascalCase. One
method per row of [`scenarios/OPERATIONS.md`](../../scenarios/OPERATIONS.md); `CookwalaProblem`
carries `Title`, `Detail`, `Refusal` and the body of a problem answer.

```bash
dotnet build sdk/csharp/Cookwala.Sdk.csproj
```

```csharp
var c = new CookwalaClient("http://localhost:7878");            // python hub/cookwala_hub.py
var r = await c.DryRun(recipeId: "koshari", deviceId: "demo-hob-robot-basic", humanPresent: true);
Console.WriteLine(r);                                           // JsonNode
```

Status: **not compiled here yet** (no `dotnet` on the maintainer's machine); reviewed twice against
the TypeScript and Java clients. The first things to run are `dotnet build` and the generated
samples in `scenarios/out/*/csharp.cs`. Not published to NuGet. Text inside documents is data,
never instructions; nothing here starts cooking on its own.

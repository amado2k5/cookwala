using System;
using System.IO;
using Xunit;

namespace Cookwala.Samples.Tests
{
    [Collection("Console")]
    public class CliTests
    {
        private static int Run(params string[] args)
        {
            var (o, e) = (Console.Out, Console.Error);
            Console.SetOut(TextWriter.Null); Console.SetError(TextWriter.Null);
            try { return Cookwala.Samples.Cli.Program.Main(args); }
            finally { Console.SetOut(o); Console.SetError(e); }
        }

        [Fact]
        public void RunExitCodes()
        {
            foreach (var fmt in new[] { "csv", "markdown", "json", "junit" })  // a run that did not complete exits 1 in every format
                Assert.Equal(1, Run("run", "koshari", "--human-present", "--fault", "example-koshari#n14=overheat", "--format", fmt));
            Assert.Equal(0, Run("run", "lentil", "--human-present", "--format", "csv"));
            Assert.Equal(2, Run("run"));
            Assert.Equal(2, Run("run", "koshari", "--fault", "n1=explode"));
            Assert.Equal(2, Run("run", "koshari", "--fault", "noequals"));
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace BlindMatch.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory()) // This will look in the API project during ef commands if set up correctly
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile(Path.Combine("src", "BlindMatch.API", "appsettings.json"), optional: true)
            .Build();

        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
                               ?? "Server=(localdb)\\mssqllocaldb;Database=BlindMatchPAS_DB;Trusted_Connection=True;MultipleActiveResultSets=true";

        builder.UseSqlServer(connectionString, b => b.MigrationsAssembly("BlindMatch.Infrastructure"));

        return new ApplicationDbContext(builder.Options);
    }
}

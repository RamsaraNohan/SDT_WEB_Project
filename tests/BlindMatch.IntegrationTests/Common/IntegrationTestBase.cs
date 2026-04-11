using BlindMatch.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace BlindMatch.IntegrationTests.Common;

public abstract class IntegrationTestBase : IDisposable
{
    private readonly DbConnection _connection;
    protected readonly ApplicationDbContext Context;

    protected IntegrationTestBase()
    {
        // 1. Setup SQLite In-Memory connection (must be kept open)
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        // 2. Build DbContext options
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        // 3. Create context and ensure schema matches
        Context = new ApplicationDbContext(options);
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Dispose();
        _connection.Dispose();
    }
}

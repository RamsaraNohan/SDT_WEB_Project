using BlindMatch.API.Models.Auth;
using BlindMatch.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public AuthController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var (succeeded, token, refreshToken) = await _identityService.LoginAsync(request.Email, request.Password);

            if (!succeeded)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            return Ok(new AuthResponse(token!, refreshToken!));
        }
        catch (Exception ex)
        {
            // 🔥 ULTIMATE FORENSIC SNIFFER: No more hidden errors
            return StatusCode(500, new { 
                error = "Internal Crash Detected",
                message = ex.Message,
                stackTrace = ex.StackTrace,
                innerException = ex.InnerException?.Message,
                source = ex.Source
            });
        }
    }

    [HttpPost("bootstrap")]
    public async Task<IActionResult> Bootstrap([FromServices] IApplicationDbContext context, [FromServices] UserManager<ApplicationUser> userManager, [FromServices] RoleManager<IdentityRole<Guid>> roleManager)
    {
        try
        {
            var dbContext = (ApplicationDbContext)context;
            
            // 🔥 NUCLEAR OPTION: Clean Slate
            // We use this to resolve fragmented production schemas.
            // WARNING: This will drop tables and recreate them.
            // await dbContext.Database.EnsureDeletedAsync(); // Uncomment ONLY if massive schema corruption persists
            
            Log.Information("🚀 BOOTSTRAP: Starting Migration...");
            await dbContext.Database.MigrateAsync();

            Log.Information("🚀 BOOTSTRAP: Starting Seeding...");
            await DatabaseSeeder.SeedAsync(dbContext, userManager, roleManager);

            return Ok(new { 
                Status = "Bootstrap Successful", 
                Timestamp = DateTime.UtcNow,
                Message = "Database schema has been synchronized and data has been seeded."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Bootstrap Failed", details = ex.Message, stack = ex.StackTrace });
        }
    }

    [HttpGet("diagnostic")]
    public async Task<IActionResult> Diagnostic([FromServices] IConfiguration config, [FromServices] IApplicationDbContext context)
    {
        try 
        {
            var dbContext = (ApplicationDbContext)context;
            var connection = dbContext.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
                await connection.OpenAsync();

            using var command = connection.CreateCommand();
            
            // Get DB Name & Current User Schema
            command.CommandText = "SELECT DB_NAME() + ' | ' + SCHEMA_NAME()";
            var dbInfo = await command.ExecuteScalarAsync();

            // List ALL tables for forensic audit
            command.CommandText = "SELECT TABLE_SCHEMA + '.' + TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME";
            var allTables = new List<string>();
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync()) allTables.Add(reader.GetString(0));
            }

            return Ok(new
            {
                Status = "Forensic Probe Active",
                DatabaseContext = dbInfo,
                KnownTables = allTables,
                UnifiedBridgeEnabled = true,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return Ok(new {
                Status = "Critical Diagnostic Failure",
                Error = ex.Message,
                Inner = ex.InnerException?.Message
            });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var (succeeded, token, refreshToken) = await _identityService.RefreshAsync(request.Token, request.RefreshToken);

        if (!succeeded)
        {
            return BadRequest(new { message = "Invalid or expired refresh token." });
        }

        return Ok(new AuthResponse(token!, refreshToken!));
    }
}

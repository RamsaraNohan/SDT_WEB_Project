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

    [HttpGet("diagnostic")]
    public async Task<IActionResult> Diagnostic([FromServices] IConfiguration config, [FromServices] IApplicationDbContext context)
    {
        try 
        {
            var connection = context.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
                await connection.OpenAsync();

            using var command = connection.CreateCommand();
            
            // Get DB Name
            command.CommandText = "SELECT DB_NAME()";
            var dbName = await command.ExecuteScalarAsync();

            // List ALL tables for schema debugging
            command.CommandText = "SELECT TABLE_SCHEMA + '.' + TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME";
            var allTables = new List<string>();
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync()) allTables.Add(reader.GetString(0));
            }

            return Ok(new
            {
                Status = "Deep Scan Active",
                DatabaseName = dbName,
                KnownTables = allTables,
                TablesCreatedCount = allTables.Count
            });
        }
        catch (Exception ex)
        {
            return Ok(new {
                Status = "Critical Crash in Diagnostic",
                Error = ex.Message,
                Details = "Is your database password missing from the Azure Portal?",
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

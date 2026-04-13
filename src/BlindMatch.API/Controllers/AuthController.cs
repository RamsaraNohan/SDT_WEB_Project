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
            var dbPresent = !string.IsNullOrEmpty(config.GetConnectionString("DefaultConnection"));
            var jwtSecret = config["JwtSettings:Secret"];
            var jwtValid = !string.IsNullOrEmpty(jwtSecret) && jwtSecret.Length >= 32;
            var signalR = !string.IsNullOrEmpty(config["Azure:SignalR:ConnectionString"]) 
                          || !string.IsNullOrEmpty(config["Azure:SignalR:ConnectionStrng"]);

            // 🔥 ABSOLUTE TRUTH CHECK: Specifically search for the test student
            var tablesExist = false;
            var studentExists = false;
            var totalUsers = 0;
            try { 
                // We use raw SQL to avoid the ApplicationUser interface gap
                totalUsers = context.Database.SqlQueryRaw<int>("SELECT COUNT(*) as Value FROM AspNetUsers").AsEnumerable().First();
                tablesExist = true;

                // Check if our target student is actually there
                var checkStudent = context.Database.SqlQueryRaw<int>("SELECT COUNT(*) as Value FROM AspNetUsers WHERE Email = 'student-1@nsbm.ac.lk'").AsEnumerable().First();
                studentExists = checkStudent > 0;
            } catch { /* Table likely missing or migrations pending */ }

            return Ok(new {
                DatabaseConfigured = dbPresent,
                TablesCreated = tablesExist,
                TotalUsersSeeded = totalUsers,
                TestStudentExists = studentExists,
                JwtSecretConfigured = !string.IsNullOrEmpty(jwtSecret),
                JwtSecretValidLength = jwtValid,
                SignalRConfigured = signalR,
                Status = studentExists ? "System Fully Ready" : "Seeding Incomplete - Missing Student-1",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
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

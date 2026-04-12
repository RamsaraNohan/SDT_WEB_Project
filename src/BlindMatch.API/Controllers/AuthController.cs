using BlindMatch.API.Models.Auth;
using BlindMatch.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
            // 🔥 INTERNAL ERROR SNIFFER: Reveals the real crash reason to DevTools
            return StatusCode(500, new { 
                error = "Internal Crash Detected",
                details = ex.Message,
                source = ex.Source
            });
        }
    }

    [HttpGet("diagnostic")]
    public async Task<IActionResult> Diagnostic([FromServices] IConfiguration config)
    {
        var dbPresent = !string.IsNullOrEmpty(config.GetConnectionString("DefaultConnection"));
        var jwtSecret = config["JwtSettings:Secret"];
        var jwtValid = !string.IsNullOrEmpty(jwtSecret) && jwtSecret.Length >= 32;
        var signalR = !string.IsNullOrEmpty(config["Azure:SignalR:ConnectionString"]);

        return Ok(new {
            DatabaseConfigured = dbPresent,
            JwtSecretConfigured = !string.IsNullOrEmpty(jwtSecret),
            JwtSecretValidLength = jwtValid,
            SignalRConfigured = signalR,
            Note = "JWT Secret MUST be at least 32 characters long."
        });
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

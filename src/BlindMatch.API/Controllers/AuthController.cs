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

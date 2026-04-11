namespace BlindMatch.API.Models.Auth;

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string Token, string RefreshToken);

public record AuthResponse(string Token, string RefreshToken);

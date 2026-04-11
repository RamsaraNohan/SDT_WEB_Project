namespace BlindMatch.Application.Interfaces;

public interface IIdentityService
{
    Task<(bool Succeeded, string? Token, string? RefreshToken)> LoginAsync(string email, string password);
    Task<(bool Succeeded, string? Token, string? RefreshToken)> RefreshAsync(string token, string refreshToken);
}

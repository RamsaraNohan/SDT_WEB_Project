namespace BlindMatch.Application.Interfaces;

public interface IRevealService
{
    Task RevealIdentitiesAsync(Guid matchId);
}

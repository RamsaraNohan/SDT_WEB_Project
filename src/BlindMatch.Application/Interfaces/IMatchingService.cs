namespace BlindMatch.Application.Interfaces;

public interface IMatchingService
{
    Task ExpressInterestAsync(Guid supervisorId, Guid proposalId);
    Task ConfirmMatchAsync(Guid supervisorId, Guid proposalId);
}

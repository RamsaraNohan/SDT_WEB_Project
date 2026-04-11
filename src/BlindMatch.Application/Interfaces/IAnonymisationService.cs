namespace BlindMatch.Application.Interfaces;

public interface IAnonymisationService
{
    string GenerateAnonymousCode();
    Task CreatePublicViewAsync(Guid proposalId);
}

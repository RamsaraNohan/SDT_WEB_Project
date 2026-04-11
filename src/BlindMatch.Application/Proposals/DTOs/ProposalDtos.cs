using BlindMatch.Domain.Enums;

namespace BlindMatch.Application.Proposals.DTOs;

public record ProposalDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Abstract { get; init; } = string.Empty;
    public string TechStack { get; init; } = string.Empty;
    public string AnonymousCode { get; init; } = string.Empty;
    public ProposalStatus Status { get; init; }
    public string ResearchAreaName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record ProposalPublicViewDto
{
    public Guid Id { get; init; }
    public Guid ProposalId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Abstract { get; init; } = string.Empty;
    public string TechStack { get; init; } = string.Empty;
    public string AnonymousCode { get; init; } = string.Empty;
    public string ResearchAreaName { get; init; } = string.Empty;
}

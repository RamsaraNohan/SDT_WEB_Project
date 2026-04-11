using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class ProposalPublicView : BaseEntity
{
    public Guid ProposalId { get; set; }
    public string AnonymousCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Abstract { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty;
    public Guid ResearchAreaId { get; set; }
    public DateTime SubmittedAt { get; set; }

    public Proposal Proposal { get; set; } = null!;
    public ResearchArea ResearchArea { get; set; } = null!;
}

using BlindMatch.Domain.Common;
using BlindMatch.Domain.Enums;
using System.Text.Json.Serialization;

namespace BlindMatch.Domain.Entities;

public class Proposal : BaseEntity
{
    public string AnonymousCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Abstract { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty;
    public ProposalStatus Status { get; set; }
    public Guid StudentId { get; set; }
    public Guid ResearchAreaId { get; set; }
    public string? PdfBlobUrl { get; set; }
    public string? RejectionReason { get; set; }

    [JsonIgnore]
    public User Student { get; set; } = null!;
    [JsonIgnore]
    public ResearchArea ResearchArea { get; set; } = null!;
    [JsonIgnore]
    public FinalSubmission? FinalSubmission { get; set; }
}

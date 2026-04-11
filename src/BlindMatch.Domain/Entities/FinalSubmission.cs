using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class FinalSubmission : BaseEntity
{
    public Guid ProposalId { get; set; }
    public string BlobUrl { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public DateTime SubmittedAt { get; set; }

    public Proposal Proposal { get; set; } = null!;
}

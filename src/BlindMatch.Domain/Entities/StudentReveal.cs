using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class StudentReveal : BaseEntity
{
    public Guid MatchId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string? StudentPhone { get; set; }
    public string? GroupMembersJson { get; set; }
    public string? PdfDownloadUrl { get; set; }

    public Match Match { get; set; } = null!;
}

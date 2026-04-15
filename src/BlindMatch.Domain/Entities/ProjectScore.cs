using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class ProjectScore : BaseEntity
{
    public Guid MatchId { get; set; }
    public int OverallScore { get; set; }
    public string? SupervisorFeedback { get; set; }
    public DateTime GradedAt { get; set; } = DateTime.UtcNow;

    public Match Match { get; set; } = null!;
}

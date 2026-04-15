using BlindMatch.Domain.Common;

using System.Text.Json.Serialization;

namespace BlindMatch.Domain.Entities;

public class ProjectScore : BaseEntity
{
    public Guid MatchId { get; set; }
    public int OverallScore { get; set; }
    public string? SupervisorFeedback { get; set; }
    public DateTime GradedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Match Match { get; set; } = null!;
}

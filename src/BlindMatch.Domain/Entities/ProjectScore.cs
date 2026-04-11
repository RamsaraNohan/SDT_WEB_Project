using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class ProjectScore : BaseEntity
{
    public Guid MatchId { get; set; }
    public int ResearchQuality { get; set; }
    public int TechnicalImpl { get; set; }
    public int ReportClarity { get; set; }
    public int Presentation { get; set; }
    public string? SupervisorFeedback { get; set; }
    public bool IsRatified { get; set; }
    public DateTime? RatifiedAt { get; set; }

    public int TotalScore => ResearchQuality + TechnicalImpl + ReportClarity + Presentation;

    public Match Match { get; set; } = null!;
}

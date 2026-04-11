using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class SupervisionMeeting : BaseEntity
{
    public Guid MatchId { get; set; }
    public DateTime MeetingDate { get; set; }
    public int DurationMinutes { get; set; }
    public string Topics { get; set; } = string.Empty;
    public string? ActionItems { get; set; }

    public Match Match { get; set; } = null!;
}

using BlindMatch.Domain.Common;

using System.Text.Json.Serialization;

namespace BlindMatch.Domain.Entities;

public class SupervisionMeeting : BaseEntity
{
    public Guid MatchId { get; set; }
    public DateTime MeetingDate { get; set; }
    public int DurationMinutes { get; set; }
    public string Topics { get; set; } = string.Empty;
    public string? ActionItems { get; set; }

    [JsonIgnore]
    public Match Match { get; set; } = null!;
}

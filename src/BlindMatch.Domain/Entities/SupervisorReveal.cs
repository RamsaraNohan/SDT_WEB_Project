using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class SupervisorReveal : BaseEntity
{
    public Guid MatchId { get; set; }
    public string SupervisorName { get; set; } = string.Empty;
    public string SupervisorEmail { get; set; } = string.Empty;
    public string? SupervisorOffice { get; set; }
    public string? FacultyPageUrl { get; set; }

    public Match Match { get; set; } = null!;
}

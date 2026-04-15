using BlindMatch.Domain.Common;
using BlindMatch.Domain.Enums;
using System.Text.Json.Serialization;

namespace BlindMatch.Domain.Entities;

public class Match : BaseEntity
{
    public Guid ProposalId { get; set; }
    public Guid SupervisorId { get; set; }
    public MatchState State { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? RevealedAt { get; set; }

    [JsonIgnore]
    public Proposal Proposal { get; set; } = null!;
    [JsonIgnore]
    public User Supervisor { get; set; } = null!;
}

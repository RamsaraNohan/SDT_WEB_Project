using System.Text.Json.Serialization;

namespace BlindMatch.Domain.Entities;

public class SupervisorExpertise
{
    public Guid SupervisorId { get; set; }
    public Guid ResearchAreaId { get; set; }

    [JsonIgnore]
    public User Supervisor { get; set; } = null!;
    [JsonIgnore]
    public ResearchArea ResearchArea { get; set; } = null!;
}

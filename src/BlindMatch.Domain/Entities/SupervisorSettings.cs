using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class SupervisorSettings : BaseEntity
{
    public Guid SupervisorId { get; set; }
    public int MaxCapacity { get; set; } = 4;

    public User Supervisor { get; set; } = null!;
}

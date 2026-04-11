namespace BlindMatch.Domain.Entities;

public class SupervisorExpertise
{
    public Guid SupervisorId { get; set; }
    public Guid ResearchAreaId { get; set; }

    public User Supervisor { get; set; } = null!;
    public ResearchArea ResearchArea { get; set; } = null!;
}

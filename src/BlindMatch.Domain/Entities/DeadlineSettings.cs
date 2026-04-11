namespace BlindMatch.Domain.Entities;

public class DeadlineSettings
{
    public int Id { get; set; } = 1; // Always 1
    public DateTime ProposalOpenAt { get; set; }
    public DateTime ProposalCloseAt { get; set; }
    public DateTime FinalSubmissionDeadline { get; set; }
    public int MaxProjectsPerSupervisor { get; set; } = 4;
}

using BlindMatch.Domain.Common;
using BlindMatch.Domain.Enums;
using System.Text.Json.Serialization;

namespace BlindMatch.Domain.Entities;

public class ProjectIteration : BaseEntity
{
    public Guid MatchId { get; set; }
    
    // The student's submission iteration text or URL (e.g., github repo or Google drive link)
    public string SubmissionContent { get; set; } = string.Empty;
    
    // The iteration cycle number, e.g. 1, 2, 3
    public int IterationNumber { get; set; }
    
    public DateTime SubmittedAt { get; set; }
    
    // Supervisor's feedback
    public string? SupervisorFeedback { get; set; }
    
    public DateTime? ReviewedAt { get; set; }
    
    public decimal? AssignedMarks { get; set; }
    
    public IterationStatus Status { get; set; }
    
    // Navigation Property
    [JsonIgnore]
    public Match Match { get; set; } = null!;
}

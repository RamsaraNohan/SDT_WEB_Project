using BlindMatch.Domain.Common;

/* Domain */

namespace BlindMatch.Domain.Entities;

public class ResearchArea : BaseEntity

{
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;

    public ICollection<SupervisorExpertise> SupervisorExpertises { get; set; } = new List<SupervisorExpertise>();
}

using Microsoft.AspNetCore.Identity;

namespace BlindMatch.Infrastructure.Persistence;

public class ApplicationUser : IdentityUser<Guid>
{
    // These properties map to the same columns as the Domain.User entity
    public string FullName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? OfficeLocation { get; set; }
    public string? FacultyPageUrl { get; set; }
    public bool IsGroupLead { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

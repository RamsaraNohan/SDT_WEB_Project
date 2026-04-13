using Microsoft.AspNetCore.Identity;

namespace BlindMatch.Domain.Entities;

public class User : IdentityUser<Guid>
{
    // 🔥 UNIFIED DOMAIN & SECURITY PROPERTIES
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

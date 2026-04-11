using BlindMatch.Domain.Common;

namespace BlindMatch.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Department { get; set; }
    public string? OfficeLocation { get; set; }
    public string? FacultyPageUrl { get; set; }
    public bool IsGroupLead { get; set; }
    public bool IsActive { get; set; } = true;
}

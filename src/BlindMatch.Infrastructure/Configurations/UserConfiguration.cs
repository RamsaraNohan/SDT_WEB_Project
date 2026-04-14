using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // User inherits from IdentityUser<Guid> so it maps to AspNetUsers automatically.
        // We only configure our custom extra columns here.
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(200);
        builder.Property(u => u.Department).HasMaxLength(100);
        builder.Property(u => u.OfficeLocation).HasMaxLength(100);

        // Soft-delete filter - only show non-deleted users by default
        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}

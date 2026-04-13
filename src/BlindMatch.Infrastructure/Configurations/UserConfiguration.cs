using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // 🔥 SHARED TABLE MAPPING
        builder.ToTable("AspNetUsers");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(200);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.Property(u => u.Department).HasMaxLength(100);
        builder.Property(u => u.OfficeLocation).HasMaxLength(100);
        
        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}

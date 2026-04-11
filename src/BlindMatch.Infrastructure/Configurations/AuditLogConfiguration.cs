using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(al => al.Id);
        
        builder.Property(al => al.Action).IsRequired().HasMaxLength(100);
        builder.Property(al => al.EntityType).IsRequired().HasMaxLength(100);
        
        // NO soft-delete filter on AuditLogs
    }
}

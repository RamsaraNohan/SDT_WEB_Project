using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class ResearchAreaConfiguration : IEntityTypeConfiguration<ResearchArea>
{
    public void Configure(EntityTypeBuilder<ResearchArea> builder)
    {
        builder.HasKey(ra => ra.Id);
        builder.Property(ra => ra.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(ra => ra.Name).IsUnique();
        
        builder.HasQueryFilter(ra => !ra.IsDeleted);
    }
}

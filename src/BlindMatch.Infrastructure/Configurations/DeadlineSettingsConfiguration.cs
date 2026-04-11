using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class DeadlineSettingsConfiguration : IEntityTypeConfiguration<DeadlineSettings>
{
    public void Configure(EntityTypeBuilder<DeadlineSettings> builder)
    {
        builder.HasKey(ds => ds.Id);
        builder.Property(ds => ds.Id).ValueGeneratedNever(); // Always 1
    }
}

using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class SupervisorSettingsConfiguration : IEntityTypeConfiguration<SupervisorSettings>
{
    public void Configure(EntityTypeBuilder<SupervisorSettings> builder)
    {
        builder.HasKey(ss => ss.Id);

        builder.HasOne(ss => ss.Supervisor)
            .WithOne()
            .HasForeignKey<SupervisorSettings>(ss => ss.SupervisorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(ss => !ss.IsDeleted);
    }
}

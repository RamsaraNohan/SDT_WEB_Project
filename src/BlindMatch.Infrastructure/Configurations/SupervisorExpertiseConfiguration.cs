using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class SupervisorExpertiseConfiguration : IEntityTypeConfiguration<SupervisorExpertise>
{
    public void Configure(EntityTypeBuilder<SupervisorExpertise> builder)
    {
        builder.HasKey(se => new { se.SupervisorId, se.ResearchAreaId });

        builder.HasOne(se => se.Supervisor)
            .WithMany()
            .HasForeignKey(se => se.SupervisorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(se => se.ResearchArea)
            .WithMany(ra => ra.SupervisorExpertises)
            .HasForeignKey(se => se.ResearchAreaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

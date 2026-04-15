using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class ProjectScoreConfiguration : IEntityTypeConfiguration<ProjectScore>
{
    public void Configure(EntityTypeBuilder<ProjectScore> builder)
    {
        builder.HasKey(ps => ps.Id);

        builder.HasOne(ps => ps.Match)
            .WithOne()
            .HasForeignKey<ProjectScore>(ps => ps.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(ps => ps.OverallScore).IsRequired();

        // UNIQUE constraint
        builder.HasIndex(ps => ps.MatchId).IsUnique();

        // DO NOT apply soft-delete filter to Scores as per requirement
    }
}

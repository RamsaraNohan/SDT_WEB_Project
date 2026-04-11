using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.HasKey(m => m.Id);

        builder.HasOne(m => m.Proposal)
            .WithMany()
            .HasForeignKey(m => m.ProposalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Supervisor)
            .WithMany()
            .HasForeignKey(m => m.SupervisorId)
            .OnDelete(DeleteBehavior.Restrict);

        // UNIQUE constraint (Filtered): only one Confirmed match per proposal
        builder.HasIndex(m => new { m.ProposalId })
            .IsUnique()
            .HasFilter("[State] = 1"); // 1 is Confirmed in MatchState enum

        // Performance Indexes
        builder.HasIndex(m => m.SupervisorId);
        builder.HasIndex(m => m.State);

        // DO NOT apply soft-delete filter to Matches as per requirement
    }
}

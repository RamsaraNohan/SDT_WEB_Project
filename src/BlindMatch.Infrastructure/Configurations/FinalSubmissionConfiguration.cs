using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class FinalSubmissionConfiguration : IEntityTypeConfiguration<FinalSubmission>
{
    public void Configure(EntityTypeBuilder<FinalSubmission> builder)
    {
        builder.HasKey(fs => fs.Id);

        builder.HasOne(fs => fs.Proposal)
            .WithOne(p => p.FinalSubmission)
            .HasForeignKey<FinalSubmission>(fs => fs.ProposalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(fs => fs.BlobUrl).IsRequired().HasMaxLength(500);
        builder.Property(fs => fs.OriginalFileName).IsRequired().HasMaxLength(256);

        // UNIQUE constraint
        builder.HasIndex(fs => fs.ProposalId).IsUnique();

        builder.HasQueryFilter(fs => !fs.IsDeleted);
    }
}

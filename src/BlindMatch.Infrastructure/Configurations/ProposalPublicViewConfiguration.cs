using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class ProposalPublicViewConfiguration : IEntityTypeConfiguration<ProposalPublicView>
{
    public void Configure(EntityTypeBuilder<ProposalPublicView> builder)
    {
        builder.HasKey(pv => pv.Id);
        
        builder.Property(pv => pv.AnonymousCode).IsRequired().HasMaxLength(20);
        builder.Property(pv => pv.Title).IsRequired().HasMaxLength(200);
        builder.Property(pv => pv.Abstract).IsRequired().HasMaxLength(2000);
        builder.Property(pv => pv.TechStack).HasMaxLength(500);

        builder.HasOne(pv => pv.Proposal)
            .WithOne()
            .HasForeignKey<ProposalPublicView>(pv => pv.ProposalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pv => pv.ResearchArea)
            .WithMany()
            .HasForeignKey(pv => pv.ResearchAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(pv => !pv.IsDeleted);
        
        // Ensure no unintentional column for StudentId exists
        // (This is primarily handled by the entity definition in Domain)
    }
}

using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class ProposalConfiguration : IEntityTypeConfiguration<Proposal>
{
    public void Configure(EntityTypeBuilder<Proposal> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.AnonymousCode).IsRequired().HasMaxLength(20);
        builder.HasIndex(p => p.AnonymousCode).IsUnique();
        
        builder.Property(p => p.Title).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Abstract).IsRequired().HasMaxLength(2000);
        builder.Property(p => p.TechStack).HasMaxLength(500);

        // Performance Indexes
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.ResearchAreaId);
        builder.HasIndex(p => p.AnonymousCode).IsUnique();

        builder.HasOne(p => p.Student)
            .WithMany()
            .HasForeignKey(p => p.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.ResearchArea)
            .WithMany()
            .HasForeignKey(p => p.ResearchAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}

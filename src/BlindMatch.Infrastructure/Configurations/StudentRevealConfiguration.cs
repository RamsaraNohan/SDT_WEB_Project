using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class StudentRevealConfiguration : IEntityTypeConfiguration<StudentReveal>
{
    public void Configure(EntityTypeBuilder<StudentReveal> builder)
    {
        builder.HasKey(sr => sr.Id);
        
        builder.HasOne(sr => sr.Match)
            .WithOne()
            .HasForeignKey<StudentReveal>(sr => sr.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(sr => sr.StudentName).IsRequired().HasMaxLength(200);
        builder.Property(sr => sr.StudentEmail).IsRequired().HasMaxLength(256);

        builder.HasQueryFilter(sr => !sr.IsDeleted);
    }
}

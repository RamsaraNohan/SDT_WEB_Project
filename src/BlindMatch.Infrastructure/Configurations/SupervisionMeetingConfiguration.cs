using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BlindMatch.Infrastructure.Configurations;

public class SupervisionMeetingConfiguration : IEntityTypeConfiguration<SupervisionMeeting>
{
    public void Configure(EntityTypeBuilder<SupervisionMeeting> builder)
    {
        builder.HasKey(sm => sm.Id);

        builder.HasOne(sm => sm.Match)
            .WithMany()
            .HasForeignKey(sm => sm.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(sm => sm.Topics).IsRequired().HasMaxLength(2000);
        builder.Property(sm => sm.ActionItems).HasMaxLength(2000);

        builder.HasQueryFilter(sm => !sm.IsDeleted);
    }
}

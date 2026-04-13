using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace BlindMatch.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> DomainUsers => Set<User>();
    public DbSet<ResearchArea> ResearchAreas => Set<ResearchArea>();
    public DbSet<Proposal> Proposals => Set<Proposal>();
    public DbSet<ProposalPublicView> ProposalPublicViews => Set<ProposalPublicView>();
    public DbSet<SupervisorExpertise> SupervisorExpertises => Set<SupervisorExpertise>();
    public DbSet<SupervisorSettings> SupervisorSettings => Set<SupervisorSettings>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<StudentReveal> StudentReveals => Set<StudentReveal>();
    public DbSet<SupervisorReveal> SupervisorReveals => Set<SupervisorReveal>();
    public DbSet<SupervisionMeeting> SupervisionMeetings => Set<SupervisionMeeting>();
    public DbSet<FinalSubmission> FinalSubmissions => Set<FinalSubmission>();
    public DbSet<ProjectScore> ProjectScores => Set<ProjectScore>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<DeadlineSettings> DeadlineSettings => Set<DeadlineSettings>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // 🔥 1. ABSOLUTE SCHEMA ANCHOR
        builder.HasDefaultSchema("dbo");

        // 🔥 3. EXPLICIT IDENTITY MAPPINGS (Prevents Azure SQL naming conflicts)
        builder.Entity<IdentityRole<Guid>>(b => b.ToTable("AspNetRoles"));
        builder.Entity<IdentityRoleClaim<Guid>>(b => b.ToTable("AspNetRoleClaims"));
        builder.Entity<IdentityUserRole<Guid>>(b => b.ToTable("AspNetUserRoles"));
        builder.Entity<IdentityUserClaim<Guid>>(b => b.ToTable("AspNetUserClaims"));
        builder.Entity<IdentityUserLogin<Guid>>(b => b.ToTable("AspNetUserLogins"));
        builder.Entity<IdentityUserToken<Guid>>(b => b.ToTable("AspNetUserTokens"));

        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Deleted:
                    entry.Entity.IsDeleted = true;
                    entry.State = EntityState.Modified;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        // Audit for Unified User
        foreach (var entry in ChangeTracker.Entries<User>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Deleted:
                    entry.Entity.IsDeleted = true;
                    entry.State = EntityState.Modified;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}

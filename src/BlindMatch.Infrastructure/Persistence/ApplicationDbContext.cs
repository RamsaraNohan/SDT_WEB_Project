using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace BlindMatch.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IApplicationDbContext
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

        // 🔥 2. THE UNIFIED BRIDGE: Table Splitting for User & ApplicationUser
        // This maps the Domain entity and the Security entity to the SAME physical row.
        builder.Entity<ApplicationUser>(b =>
        {
            b.ToTable("AspNetUsers"); // Explicit name for Azure
            
            // Map the relationship to the domain entity
            // Since they share the same ID, they share the same row.
        });

        builder.Entity<User>(b =>
        {
            b.ToTable("AspNetUsers"); // Shared table!
            b.HasKey(u => u.Id);
            
            // 🔥 THE MISSING LINK: Define 1-to-1 Relationship
            b.HasOne<ApplicationUser>()
             .WithOne()
             .HasForeignKey<User>(u => u.Id);
            
            // Ensure Entity Framework understands this is the same row as ApplicationUser
            b.Property(u => u.FullName).HasMaxLength(200).IsRequired();
            b.Property(u => u.Email).HasMaxLength(256).IsRequired();
        });

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

        // Special handling for ApplicationUser entity since it doesn't inherit from BaseEntity
        foreach (var entry in ChangeTracker.Entries<ApplicationUser>())
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

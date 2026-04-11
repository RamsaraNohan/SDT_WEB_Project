using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace BlindMatch.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> DomainUsers { get; }
    DbSet<ResearchArea> ResearchAreas { get; }
    DbSet<Proposal> Proposals { get; }
    DbSet<ProposalPublicView> ProposalPublicViews { get; }
    DbSet<SupervisorExpertise> SupervisorExpertises { get; }
    DbSet<SupervisorSettings> SupervisorSettings { get; }
    DbSet<Match> Matches { get; }
    DbSet<StudentReveal> StudentReveals { get; }
    DbSet<SupervisorReveal> SupervisorReveals { get; }
    DbSet<SupervisionMeeting> SupervisionMeetings { get; }
    DbSet<FinalSubmission> FinalSubmissions { get; }
    DbSet<ProjectScore> ProjectScores { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<DeadlineSettings> DeadlineSettings { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

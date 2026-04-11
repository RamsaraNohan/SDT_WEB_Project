using BlindMatch.Application.Interfaces;
using BlindMatch.Application.Services;
using BlindMatch.Domain.Entities;
using BlindMatch.Domain.Enums;
using BlindMatch.IntegrationTests.Common;
using BlindMatch.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BlindMatch.IntegrationTests;

public class MatchingServiceTests : IntegrationTestBase
{
    private readonly IMatchingService _matchingService;
    private readonly IRevealService _revealService;

    public MatchingServiceTests()
    {
        _revealService = new RevealService(Context);
        _matchingService = new MatchingService(Context, _revealService);
    }

    [Fact]
    public async Task ConfirmMatchAsync_ShouldSucceed_WhenValid()
    {
        // 1. Arrange
        var supervisorId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var areaId = Guid.NewGuid();
        
        var area = new ResearchArea { Id = areaId, Name = "AI" };
        var student = new User { Id = studentId, FullName = "Stu 1", Email = "stu1@test.com" };
        var supervisorDomain = new User { Id = supervisorId, FullName = "Sup 1", Email = "sup1@test.com" };
        var supervisorIdentity = new ApplicationUser 
        { 
            Id = supervisorId, 
            FullName = "Sup 1", 
            UserName = "sup1@test.com", 
            Email = "sup1@test.com",
            NormalizedEmail = "SUP1@TEST.COM",
            NormalizedUserName = "SUP1@TEST.COM"
        };

        Context.ResearchAreas.Add(area);
        Context.DomainUsers.Add(student);
        Context.DomainUsers.Add(supervisorDomain);
        Context.Users.Add(supervisorIdentity);
        await Context.SaveChangesAsync();

        var proposal = new Proposal 
        { 
            Id = Guid.NewGuid(), 
            StudentId = studentId, 
            Title = "Test Prop", 
            Status = ProposalStatus.Pending,
            ResearchAreaId = areaId,
            AnonymousCode = "PROP-001"
        };
        Context.Proposals.Add(proposal);
        Context.SupervisorSettings.Add(new SupervisorSettings { SupervisorId = supervisorId, MaxCapacity = 5 });
        await Context.SaveChangesAsync();

        var match = new BlindMatch.Domain.Entities.Match 
        { 
            Id = Guid.NewGuid(),
            SupervisorId = supervisorId, 
            ProposalId = proposal.Id, 
            State = MatchState.Interested 
        };
        Context.Matches.Add(match);
        await Context.SaveChangesAsync();

        // 2. Act
        await _matchingService.ConfirmMatchAsync(supervisorId, proposal.Id);

        // 3. Assert
        var updatedMatch = await Context.Matches.FirstOrDefaultAsync(m => m.ProposalId == proposal.Id);
        updatedMatch.Should().NotBeNull();
        updatedMatch!.State.Should().Be(MatchState.Confirmed);
        
        var updatedProposal = await Context.Proposals.FindAsync(proposal.Id);
        updatedProposal!.Status.Should().Be(ProposalStatus.Matched);

        var reveal = await Context.StudentReveals.AnyAsync(r => r.MatchId == updatedMatch.Id);
        reveal.Should().BeTrue();
    }

    [Fact]
    public async Task ConfirmMatchAsync_ShouldThrow_WhenCapacityExceeded()
    {
        // 1. Arrange
        var supervisorId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var areaId = Guid.NewGuid();

        var area = new ResearchArea { Id = areaId, Name = "Data Science" };
        var student = new User { Id = studentId, FullName = "Stu 2", Email = "stu2@test.com" };
        var supervisorDomain = new User { Id = supervisorId, FullName = "Sup Exp", Email = "sup2@test.com" };
        var supervisorIdentity = new ApplicationUser 
        { 
            Id = supervisorId, 
            FullName = "Sup Exp", 
            UserName = "sup2@test.com", 
            Email = "sup2@test.com",
            NormalizedEmail = "SUP2@TEST.COM",
            NormalizedUserName = "SUP2@TEST.COM" 
        };

        Context.ResearchAreas.Add(area);
        Context.DomainUsers.Add(student);
        Context.DomainUsers.Add(supervisorDomain);
        Context.Users.Add(supervisorIdentity);
        await Context.SaveChangesAsync();

        var placeholderProposal = new Proposal 
        { 
            Id = Guid.NewGuid(), 
            StudentId = studentId, 
            Title = "Existing Prop", 
            Status = ProposalStatus.Matched, 
            ResearchAreaId = areaId,
            AnonymousCode = "PROP-CONFIRMED-01"
        };
        Context.Proposals.Add(placeholderProposal);

        Context.SupervisorSettings.Add(new SupervisorSettings { SupervisorId = supervisorId, MaxCapacity = 1 });
        await Context.SaveChangesAsync();

        var existingMatch = new BlindMatch.Domain.Entities.Match 
        { 
            Id = Guid.NewGuid(),
            SupervisorId = supervisorId, 
            ProposalId = placeholderProposal.Id, 
            State = MatchState.Confirmed 
        };
        Context.Matches.Add(existingMatch);
        await Context.SaveChangesAsync();

        var newProposal = new Proposal 
        { 
            Id = Guid.NewGuid(), 
            StudentId = studentId, 
            Title = "New Prop", 
            Status = ProposalStatus.Pending,
            ResearchAreaId = areaId,
            AnonymousCode = "PROP-NEW-02"
        };
        Context.Proposals.Add(newProposal);
        await Context.SaveChangesAsync();
        
        Context.Matches.Add(new BlindMatch.Domain.Entities.Match 
        { 
            Id = Guid.NewGuid(),
            SupervisorId = supervisorId, 
            ProposalId = newProposal.Id, 
            State = MatchState.Interested 
        });
        await Context.SaveChangesAsync();

        // 2. Act & Assert
        var act = () => _matchingService.ConfirmMatchAsync(supervisorId, newProposal.Id);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("CAPACITY_EXCEEDED");
    }
}

using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using BlindMatch.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Services;

public class MatchingService : IMatchingService
{
    private readonly IApplicationDbContext _context;
    private readonly IRevealService _revealService;

    public MatchingService(IApplicationDbContext context, IRevealService revealService)
    {
        _context = context;
        _revealService = revealService;
    }

    public async Task ExpressInterestAsync(Guid supervisorId, Guid proposalId)
    {
        var proposal = await _context.Proposals.FindAsync(proposalId);
        if (proposal == null || (proposal.Status != ProposalStatus.Pending && proposal.Status != ProposalStatus.UnderReview))
            return;

        // 🔥 CONSTRAINT: No interest if student already matched elsewhere
        var studentId = proposal.StudentId;
        var studentAlreadyMatched = await _context.Proposals
            .AnyAsync(p => p.StudentId == studentId && p.Status == ProposalStatus.Matched);
        
        if (studentAlreadyMatched) return;


        var existingMatch = await _context.Matches
            .FirstOrDefaultAsync(m => m.SupervisorId == supervisorId && m.ProposalId == proposalId);

        if (existingMatch != null) return;

        var match = new Match
        {
            SupervisorId = supervisorId,
            ProposalId = proposalId,
            State = MatchState.Interested
        };

        proposal.Status = ProposalStatus.UnderReview;
        
        await _context.Matches.AddAsync(match);
        await _context.SaveChangesAsync();
        
        // TODO: Trigger notification to student: "A supervisor has shown interest"
    }

    public async Task ConfirmMatchAsync(Guid supervisorId, Guid proposalId)
    {
        var settings = await _context.SupervisorSettings
            .FirstOrDefaultAsync(s => s.SupervisorId == supervisorId);
        
        var maxCapacity = settings?.MaxCapacity ?? 4;
        
        var currentConfirmedCount = await _context.Matches
            .CountAsync(m => m.SupervisorId == supervisorId && m.State == MatchState.Confirmed);

        if (currentConfirmedCount >= maxCapacity)
        {
            throw new InvalidOperationException("CAPACITY_EXCEEDED");
        }

        var match = await _context.Matches
            .FirstOrDefaultAsync(m => m.SupervisorId == supervisorId && m.ProposalId == proposalId);

        if (match == null || match.State != MatchState.Interested)
            return;

        var proposal = await _context.Proposals.FindAsync(proposalId);
        if (proposal == null || proposal.Status == ProposalStatus.Matched)
            return;

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Confirm this match
            match.State = MatchState.Confirmed;
            match.ConfirmedAt = DateTime.UtcNow;
            proposal.Status = ProposalStatus.Matched;

            // 2. Withdraw all other interests for this STUDENT (across all their proposals if any)
            var studentId = proposal.StudentId;
            var allStudentInterests = await _context.Matches
                .Include(m => m.Proposal)
                .Where(m => m.Proposal.StudentId == studentId && m.Id != match.Id && m.State == MatchState.Interested)
                .ToListAsync();

            foreach (var other in allStudentInterests)
            {
                other.State = MatchState.Withdrawn;
            }
            
            // Also mark other proposals by this student as Archived if they exist
            var otherStudentProposals = await _context.Proposals
                .Where(p => p.StudentId == studentId && p.Id != proposalId && p.Status != ProposalStatus.Matched)
                .ToListAsync();
            
            foreach (var otherProp in otherStudentProposals)
            {
                otherProp.Status = ProposalStatus.Deleted; // Or add an 'Archived' status
            }


            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // 3. Trigger reveal
            await _revealService.RevealIdentitiesAsync(match.Id);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}

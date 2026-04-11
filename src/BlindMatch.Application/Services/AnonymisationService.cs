using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Services;

public class AnonymisationService : IAnonymisationService
{
    private readonly IApplicationDbContext _context;

    public AnonymisationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public string GenerateAnonymousCode()
    {
        var year = DateTime.UtcNow.Year;
        // This is a simple implementation. In production, we'd use a more robust sequential counter or a random unique code.
        // For the coursework, we'll use a Guid-based short code or a timestamp-based one.
        // Let's use a 4-digit random number to match the AP-YYYY-XXXX format.
        var random = new Random();
        return $"AP-{year}-{random.Next(1000, 9999)}";
    }

    public async Task CreatePublicViewAsync(Guid proposalId)
    {
        var proposal = await _context.Proposals
            .Include(p => p.ResearchArea)
            .FirstOrDefaultAsync(p => p.Id == proposalId);

        if (proposal == null) return;

        var publicView = new ProposalPublicView
        {
            ProposalId = proposal.Id,
            AnonymousCode = proposal.AnonymousCode,
            Title = proposal.Title,
            Abstract = proposal.Abstract,
            TechStack = proposal.TechStack,
            ResearchAreaId = proposal.ResearchAreaId,
            SubmittedAt = DateTime.UtcNow
        };

        await _context.ProposalPublicViews.AddAsync(publicView);
        await _context.SaveChangesAsync();
    }
}

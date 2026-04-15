using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace BlindMatch.Application.Proposals.Commands;

public class PublishProposalCommand : IRequest
{
    public Guid ProposalId { get; set; }
}

public class PublishProposalCommandHandler : IRequestHandler<PublishProposalCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public PublishProposalCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(PublishProposalCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _context.Proposals.FindAsync(new object[] { request.ProposalId }, cancellationToken);
        
        if (proposal == null) throw new Exception("Proposal not found.");
        if (proposal.StudentId != _currentUser.UserId) throw new UnauthorizedAccessException();
        if (proposal.Status != ProposalStatus.Draft) throw new Exception("Only drafts can be published.");
        
        // 🔥 CONSTRAINT: 1 Active Proposal per Student
        var hasActiveProposal = await _context.Proposals
            .AnyAsync(p => p.StudentId == proposal.StudentId && 
                          (p.Status == ProposalStatus.Pending || 
                           p.Status == ProposalStatus.UnderReview || 
                           p.Status == ProposalStatus.Matched),
                      cancellationToken);

        if (hasActiveProposal)
        {
            throw new InvalidOperationException("ALREADY_HAS_ACTIVE_PROPOSAL");
        }

        proposal.Status = ProposalStatus.Submitted;
        await _context.SaveChangesAsync(cancellationToken);
    }
}

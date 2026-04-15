using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Enums;
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

        proposal.Status = ProposalStatus.Submitted;
        await _context.SaveChangesAsync(cancellationToken);
    }
}

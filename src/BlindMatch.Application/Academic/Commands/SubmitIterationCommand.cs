using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using BlindMatch.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Academic.Commands;

public class SubmitIterationCommand : IRequest<Guid>
{
    public Guid MatchId { get; set; }
    public string SubmissionContent { get; set; } = string.Empty;
}

public class SubmitIterationCommandHandler : IRequestHandler<SubmitIterationCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SubmitIterationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(SubmitIterationCommand request, CancellationToken cancellationToken)
    {
        var match = await _context.Matches
            .Include(m => m.Proposal)
            .FirstOrDefaultAsync(m => m.Id == request.MatchId, cancellationToken);

        if (match == null) throw new Exception("Match not found.");
        
        // Only the student assigned to the proposal can submit iterations
        if (match.Proposal.StudentId != _currentUser.UserId)
            throw new UnauthorizedAccessException("Only the assigned student can submit project iterations.");

        // Determine version number
        var lastVersion = await _context.ProjectIterations
            .Where(i => i.MatchId == request.MatchId)
            .OrderByDescending(i => i.IterationNumber)
            .Select(i => i.IterationNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var iteration = new ProjectIteration
        {
            MatchId = request.MatchId,
            SubmissionContent = request.SubmissionContent,
            IterationNumber = lastVersion + 1,
            SubmittedAt = DateTime.UtcNow,
            Status = IterationStatus.PendingReview
        };

        _context.ProjectIterations.Add(iteration);
        await _context.SaveChangesAsync(cancellationToken);

        return iteration.Id;
    }
}

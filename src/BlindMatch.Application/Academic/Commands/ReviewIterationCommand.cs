using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Academic.Commands;

public class ReviewIterationCommand : IRequest
{
    public Guid IterationId { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public decimal? Marks { get; set; }
    public IterationStatus Status { get; set; }
}

public class ReviewIterationCommandHandler : IRequestHandler<ReviewIterationCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ReviewIterationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(ReviewIterationCommand request, CancellationToken cancellationToken)
    {
        var iteration = await _context.ProjectIterations
            .Include(i => i.Match)
            .FirstOrDefaultAsync(i => i.Id == request.IterationId, cancellationToken);

        if (iteration == null) throw new Exception("Iteration not found.");

        // Only the assigned supervisor can review
        if (iteration.Match.SupervisorId != _currentUser.UserId)
            throw new UnauthorizedAccessException("Only the assigned supervisor can review iterations.");

        iteration.SupervisorFeedback = request.Feedback;
        iteration.AssignedMarks = request.Marks;
        iteration.Status = request.Status;
        iteration.ReviewedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}

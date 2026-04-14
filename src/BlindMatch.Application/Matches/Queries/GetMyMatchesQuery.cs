using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Matches.Queries;

public record MatchDto(Guid Id, Guid ProposalId, string Title, Guid SupervisorId, string State, DateTime? ConfirmedAt);

public record GetMyMatchesQuery : IRequest<List<MatchDto>>;

public class GetMyMatchesQueryHandler : IRequestHandler<GetMyMatchesQuery, List<MatchDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMyMatchesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<MatchDto>> Handle(GetMyMatchesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();
        var matches = await _context.Matches
            .Include(m => m.Proposal)
            .Where(m => m.Proposal.StudentId == userId || m.SupervisorId == userId)
            .Select(m => new { m.Id, m.ProposalId, m.Proposal.Title, m.SupervisorId, m.State, m.ConfirmedAt })
            .ToListAsync(cancellationToken);

        return matches.Select(m => new MatchDto(m.Id, m.ProposalId, m.Title, m.SupervisorId, m.State.ToString(), m.ConfirmedAt)).ToList();
    }
}

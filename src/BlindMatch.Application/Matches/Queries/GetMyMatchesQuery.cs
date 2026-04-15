using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Matches.Queries;

public record MatchDto(Guid Id, Guid ProposalId, string Title, Guid SupervisorId, string State, DateTime? ConfirmedAt, string? StudentName = null, string? StudentCode = null);

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
            .ThenInclude(p => p.Student)
            .Where(m => m.Proposal.StudentId == userId || m.SupervisorId == userId)
            .Select(m => new { 
                m.Id, 
                m.ProposalId, 
                m.Proposal.Title, 
                m.SupervisorId, 
                m.State, 
                m.ConfirmedAt,
                m.Proposal.AnonymousCode,
                StudentFullName = m.Proposal.Student.FullName
            })
            .ToListAsync(cancellationToken);


        return matches.Select(m => new MatchDto(
            m.Id, 
            m.ProposalId, 
            m.Title, 
            m.SupervisorId, 
            m.State.ToString(), 
            m.ConfirmedAt,
            m.State == MatchState.Confirmed && m.SupervisorId == userId ? m.StudentFullName : null,
            m.State == MatchState.Confirmed && m.SupervisorId == userId ? m.AnonymousCode : null
        )).ToList();

    }
}

using BlindMatch.Application.Interfaces;
using BlindMatch.Application.Proposals.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Proposals.Queries;

public record GetStudentProposalsQuery : IRequest<List<ProposalDto>>;

public class GetStudentProposalsQueryHandler : IRequestHandler<GetStudentProposalsQuery, List<ProposalDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetStudentProposalsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<ProposalDto>> Handle(GetStudentProposalsQuery request, CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();

        return await _context.Proposals
            .Where(p => p.StudentId == studentId)
            .Include(p => p.ResearchArea)
            .Select(p => new ProposalDto
            {
                Id = p.Id,
                Title = p.Title,
                Abstract = p.Abstract,
                TechStack = p.TechStack,
                AnonymousCode = p.AnonymousCode,
                Status = p.Status,
                ResearchAreaName = p.ResearchArea.Name,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}

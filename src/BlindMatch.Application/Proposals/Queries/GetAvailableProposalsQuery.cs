using BlindMatch.Application.Interfaces;
using BlindMatch.Application.Proposals.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Proposals.Queries;

public record GetAvailableProposalsQuery : IRequest<List<ProposalPublicViewDto>>;

public class GetAvailableProposalsQueryHandler : IRequestHandler<GetAvailableProposalsQuery, List<ProposalPublicViewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailableProposalsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProposalPublicViewDto>> Handle(GetAvailableProposalsQuery request, CancellationToken cancellationToken)
    {
        // Only return proposals that are not already matched
        return await _context.ProposalPublicViews
            .Include(pv => pv.Proposal)
            .Where(pv => pv.Proposal.Status != Domain.Enums.ProposalStatus.Matched)
            .Include(pv => pv.ResearchArea)
            .Select(pv => new ProposalPublicViewDto
            {
                Id = pv.Id,
                ProposalId = pv.ProposalId,
                Title = pv.Title,
                Abstract = pv.Abstract,
                TechStack = pv.TechStack,
                AnonymousCode = pv.AnonymousCode,
                ResearchAreaName = pv.ResearchArea.Name
            })
            .ToListAsync(cancellationToken);
    }
}

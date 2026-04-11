using BlindMatch.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.Application.Proposals.Queries;

public record GetResearchAreasQuery : IRequest<List<ResearchAreaDto>>;

public record ResearchAreaDto(Guid Id, string Name);

public class GetResearchAreasQueryHandler : IRequestHandler<GetResearchAreasQuery, List<ResearchAreaDto>>
{
    private readonly IApplicationDbContext _context;

    public GetResearchAreasQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ResearchAreaDto>> Handle(GetResearchAreasQuery request, CancellationToken cancellationToken)
    {
        return await _context.ResearchAreas
            .Select(a => new ResearchAreaDto(a.Id, a.Name))
            .OrderBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }
}
